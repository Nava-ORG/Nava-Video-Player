'use strict';

const
    fs = require('fs'),
    rpc = require("discord-rpc"),
    electron = require('electron'),
    { ipcMain } = require('electron'),
    checkInternetConnected = require('check-internet-connected'),

    app = electron.app,
    BrowserWindow = electron.BrowserWindow,
    rpcClient = new rpc.Client({ transport: 'ipc' }),

    dbFileName = './data/db.json',
    checkInternetConnectedConfig =
        {
            timeout: 5000,
            retries: 5,
            domain: 'discord.com'
        },

    dbFile = require(dbFileName),
    { DiscordRPC } = require('./lib/utils.container');



let mainWindow;


const createWindow = () =>
{
    mainWindow = new BrowserWindow(
        {
            title: 'Nava Video Player',
            'accept-first-mouse':true,
            width: 900,
            height: 650,
            'minWidth': 400,
            'minHeight': 300,
            frame: false,
            icon: __dirname+'/img/icon.png',
            webPreferences:
                {
                    nodeIntegration: true,
                    contextIsolation: false
                }
        });

    mainWindow.loadURL(`file://${__dirname}/template/player.html`)

    mainWindow.setResizable(true)

    mainWindow.on('closed', () =>
    {
        mainWindow = null
    });
}

app.on('ready', createWindow)

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin')
    {
        app.quit()
    }
})

app.on('activate',  () =>
{
    if (mainWindow === null)
    {
        createWindow()
    }
})

ipcMain.on('maximize', () =>
{
    let browserWindow = BrowserWindow.getFocusedWindow();

    browserWindow.isMaximized() ? browserWindow.unmaximize() : browserWindow.maximize();
})

ipcMain.on('minimize', () =>
{
    let browserWindow = BrowserWindow.getFocusedWindow();
    browserWindow.minimize();
});

ipcMain.on('RpcStatusOff', (event) =>
{
    dbFile.RpcStatus = false;

    fs.writeFile(dbFileName, JSON.stringify(dbFile),
        (err) =>
        {
            if (err) return console.log(err);
        });

    console.log("DiscordRPC MSG: RpcStatus turned off");
    DiscordRPC(event, "destroy", "videoName", rpcClient);
});
ipcMain.on('RpcStatusOn', (event) =>
{
    dbFile.RpcStatus = true;

    fs.writeFile(dbFileName, JSON.stringify(dbFile),
        (err) =>
        {
            if (err) return console.log(err);
        });

    console.log("DiscordRPC MSG: RpcStatus turned on");
    DiscordRPC(event, "ORG", "videoName", rpcClient);
});

ipcMain.on("DiscordRPC", (event, arg, videoName) =>
{
    if (dbFile.RpcStatus)
    {
        checkInternetConnected(checkInternetConnectedConfig)
            .then(() =>
                {
                    DiscordRPC(event, arg, videoName, rpcClient)
                }
            ).catch(() =>
        {
            console.log("DiscordRPC ERR: Not connected to internet")
        });
    }
    else
    {
        console.log("DiscordRPC MSG: DiscordRPC is off");
    }
});
