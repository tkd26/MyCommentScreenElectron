const { ipcRenderer, clipboard, shell } = require('electron');

const createButton = document.getElementById('createButton');
const enterButton = document.getElementById('enterButton');
const enterForm = document.getElementById('enterForm');
const exitButton = document.getElementById('exitButton');

const roomIdText = document.getElementById('roomIdText');

const topMenu= document.getElementById('topMenu');
const ctrlMenu = document.getElementById('ctrlMenu');

function toTopMenu() {
    topMenu.style.display = 'block';
    ctrlMenu.style.display = 'none';
}

function toCtrlMenu() {
    topMenu.style.display = 'none';
    ctrlMenu.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
    if (sessionStorage.getItem('roomId')) {
        roomIdText.value = sessionStorage.getItem('roomId')
        toCtrlMenu();
    } else {
        toTopMenu();
    }
});


// 部屋を新規作成
createButton.addEventListener('click', async () => {
    /* 
    「ipcRenderer.invoke()」（非同期メソッド）
        メインプロセスの 指定のチャンネル へ イベントと引数（ここでは空）を送信し、その処理結果をメインプロセスから受信する．
    */
    // 新規作成時は，メインプロセスでroomIdを作成し，こちらでは戻り値として受け取る
    ipcRenderer.invoke('open-screen').then((roomId) => {
        sessionStorage.setItem('roomId', roomId);
        roomIdText.value = sessionStorage.getItem('roomId');
    });

    toCtrlMenu();

});

// 部屋IDから既にある部屋を使用する
enterButton.addEventListener('click', async () => {

    // roomIdを指定する場合は，こちらの値を引数としてメインプロセスへ送る．
    const roomId = enterForm.inputRoomId.value;

    ipcRenderer.invoke('open-screen', roomId).then((roomId) => {
        sessionStorage.setItem('roomId', roomId);
        roomIdText.value = sessionStorage.getItem('roomId');

    });

    toCtrlMenu();

});

// 退出
exitButton.addEventListener('click', async () => {
    sessionStorage.removeItem('roomId');

    toTopMenu();

    // メインプロセスの open-screen チャネルへ送信
    ipcRenderer.invoke('close-screen');
});

// クリップボードにコピーする関数
function copyToClipboard() {
    // コピー対象をJavaScript上で変数として定義する
    let copyTarget = document.getElementById("roomIdText");

    // コピー対象のテキストを選択する
    copyTarget.select();

    // 選択しているテキストをクリップボードにコピーする
    clipboard.writeText(copyTarget.value); 
    
    alert('コピーしました．')
}