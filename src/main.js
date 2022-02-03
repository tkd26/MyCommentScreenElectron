const { app, BrowserWindow, BrowserView, ipcMain, screen } = require('electron');

const is_mac = process.platform==='darwin'     // macOSかどうかの判定をする

if(is_mac) {     // macOSの時のみこの設定を反映する
  app.dock.hide()          // Dockを非表示にする
}

// メインウィンドウ
const createWindow = () => {
    const width = 600;
    const height = 400;

    const mainWindow = new BrowserWindow({
        width: width,
        height: height,
        
        title: 'Comment Screen',

        minWidth: width,
        minHeight: height,

        maximizable: false, // 最大化禁止

        // Webページの機能を設定
        webPreferences: {
            nodeIntegration: true, // レンダラープロセスがNode.jsの機能を利用できるようにする
            contextIsolation: false, // メインプロセスとレンダラープロセスの JavaScript コンテキストを分離する
            },
    });

    mainWindow.loadFile('ownerTop.html');

    // メインウィンドウが閉じられたら，全てのウィンドウを閉じる
    mainWindow.on('closed', () => {
        app.quit()
    })

    /*
    「ipcMain.handle()」（非同期メソッド）
        レンダラープロセスから 指定のチャンネル へ イベントと引数（ここでは空）を受信すると、その後の処理結果をレンダラープロセスへ返信として送信する
    */
    // open-screenチャンネルを受け取ったら，サブウィンドウ（スクリーン）を作成する
    ipcMain.handle('open-screen', async (event, id, ...args) => {
        const roomId = createSubWindow(id);
        return roomId;
    });

};

// サブウィンドウ（スクリーン）
const createSubWindow = (id) => {
    const size = screen.getPrimaryDisplay().size;

    let width = size.width;
    let height = size.height;

    let win = new BrowserWindow({ 
        // 画面いっぱいのサイズにする
        width: width, 
        height: height,

        transparent: true, // 背景透過
        frame: false,       // フレームを非表示にする
        resizable: false,    // ウィンドウリサイズ禁止
    })

    win.setAlwaysOnTop(true, "screen-saver")    // 常に最前面に表示する
    win.setVisibleOnAllWorkspaces(true)      // ワークスペース（デスクトップ）を移動しても表示される
    win.setIgnoreMouseEvents(true)  // マウスイベントを無視させる

    win.on('closed', () => {
        win = null
        // ウィンドウが閉じられたとき，'close-screen'チャンネルを削除する
        // 残しておくと'open-screen'と競合？する
        ipcMain.removeHandler('close-screen');
    })

    let view = new BrowserView({
        webPreferences: {
            nodeIntegration: false
        }
    })

    const baseUrl = 'https://comment-screen-220129.herokuapp.com/owner.html';
    // 部屋IDを作成
    const roomId = (id) ? id: Math.random().toString(36).slice(-8);
    // urlに追加してgetを送信
    const url = baseUrl + '?id=' + roomId;

    win.setBrowserView(view)
    view.setBounds({ x: 0, y: 0, width: width, height: height })
    view.webContents.loadURL(url)
    view.setAutoResize({ width: true, height: true })

    // 'close-screen'を受け取ったら，サブウィンドウを閉じる
    ipcMain.handle('close-screen', async (event, ...args) => {
        win.close();
        return false;
    });

    return roomId;
}


app.on('ready', () => {
  createWindow();
});