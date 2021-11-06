const { ipcRenderer } = require('electron');
let videoInfo;

console.log('Nava - نوآ');
console.log('نوآ اولین و برترین پخش کننده نماهنگ ایرانی');

ipcRenderer.send('DiscordRPC', 'ORG');

const sendIpcRenderer = (type) =>
{
    ipcRenderer.send(type)
}

const init = () =>
{
    document.querySelector('#progressBarID').value = 0;
    document.querySelector('#volRange').value=document.querySelector('#videoContainer').volume;
    bindEvents();
}

window.addEventListener(
    'DOMContentLoaded',
    init
);

const bindEvents = () =>
{
    const video = document.querySelector('#videoContainer'),
        toggleOff = document.querySelector('#toggle-off'),
        toggleOn = document.querySelector('#toggle-on'),
        rpcToggles = document.querySelectorAll('.toggle'),
        dropArea = document.querySelector('.dropAreaParent');


    toggleOff.addEventListener('click', () => ipcRenderer.send('RpcStatusOn'))
    toggleOn.addEventListener('click', () => ipcRenderer.send('RpcStatusOff'))

    rpcToggles.forEach(rpcToggle =>
    {
        rpcToggle.addEventListener('click', () => rpcToggles.forEach(rpcToggleV => { rpcToggleV.classList.toggle("hide"); }));
    });

    video.addEventListener(
        'timeupdate',
        showProgress
    );

    video.addEventListener(
        'play',
        playing
    );

    video.addEventListener(
        'ended',
        ended
    );

    video.addEventListener(
        'pause',
        paused
    );

    video.addEventListener(
        'error',
        function(e)
        {
            videoError('ارور از فایل ورودی');
        }
    );

    video.addEventListener(
        'stalled',
        function(e)
        {
            videoError('ویدیو متوقف شده');
        }
    );

    dropArea.addEventListener(
        'dragleave',
        makeUnDroppable
    );

    dropArea.addEventListener(
        'dragenter',
        makeDroppable
    );

    dropArea.addEventListener(
        'dragover',
        makeDroppable
    );

    dropArea.addEventListener(
        'drop',
        loadVideo
    );

    document.querySelector('#playerContainer').addEventListener(
        'click',
        playerClicked
    );

    document.querySelector('#chooseVideo').addEventListener(
        'change',
        loadVideo
    );

    document.querySelector('#volRange').addEventListener(
        'change',
        adjustVolume
    );

    document.querySelector('#enterLink').addEventListener(
        'change',
        loadVideo
    );

    window.addEventListener(
        'keyup',
        function(e)
        {
            switch(e.keyCode)
            {
                case 13 : //enter
                case 32 : //space
                    togglePlay();
                    break;
            }
        }
    );
}

const maximize = () =>
{
    const player = document.querySelector('#playerContainer');
    ipcRenderer.send('maximize');
    player.classList.toggle('fullScreened');
}

const minimize = () =>
{
    ipcRenderer.send('minimize');
}

const getTime = (ms) =>
{
    const date = new Date(ms);
    const time = [];

    time.push(date.getUTCHours());
    time.push(date.getUTCMinutes());
    time.push(date.getUTCSeconds());

    return time.join(':');
}

const adjustVolume = (e) =>
{
    const video = document.querySelector('#videoContainer');
    video.volume=e.target.value;
}

const showProgress = () =>
{
    const video = document.querySelector('#videoContainer');
    const progBar = document.querySelector('#progressBarID');
    const count = document.querySelector('#count');

    progBar.value=(video.currentTime/video.duration);
    count.innerHTML = getTime(video.currentTime*1000) + '/' + getTime(video.duration*1000);
}

const togglePlay = () =>
{
    document.querySelector('.play:not(.hide),.pause:not(.hide)').click();
}

const toggleScreen = () =>
{
    document.querySelector('.fullScreen:not(.hide),.smallScreen:not(.hide)').click();
}

const playing = (e) =>
{
    const player = document.querySelector('#playerContainer');

    document.querySelector('#play').classList.add('hide');
    document.querySelector('#pause').classList.remove('hide');
    player.classList.remove('paused');

    hideFileArea();

    if (videoInfo)
    {
        ipcRenderer.send('DiscordRPC', 'play', videoInfo.name, videoInfo.type);
    }
}

const fullScreened = (e) =>
{
    const player = document.querySelector('#playerContainer');

    player.classList.add('fullScreened');
    player.requestFullscreen();
}


const smallScreened = () =>
{
    const player = document.querySelector('#playerContainer');
    player.classList.remove('fullScreened');
    document.exitFullscreen();
}


const hideFileArea = () =>
{
    const dropArea = document.querySelector('.dropAreaParent');
    dropArea.classList.add('hidden');

    setTimeout(
        function()
        {
            const dropArea = document.querySelector('.dropAreaParent');
            dropArea.classList.add('hide');
        },
        500
    );
}

const showFileArea = () =>
{
    const dropArea = document.querySelector('.dropAreaParent');
    dropArea.classList.remove('hide');

    setTimeout(
        function()
        {
            const dropArea = document.querySelector('.dropAreaParent');
            dropArea.classList.remove('hidden');
        },
        10
    );
}

const paused = () =>
{
    const player = document.querySelector('#playerContainer');

    document.querySelector('#pause').classList.add('hide');
    document.querySelector('#play').classList.remove('hide');
    player.classList.add('paused');

    showFileArea();

    ipcRenderer.send('DiscordRPC', 'pause');
}

const ended = () =>
{
    const player = document.querySelector('#playerContainer');

    document.querySelector('#play').classList.remove('hide');
    document.querySelector('#pause').classList.add('hide');
    player.classList.add('paused');

    showFileArea();

    ipcRenderer.send('DiscordRPC', 'ORG');
}

const makeDroppable = (e) =>
{
    e.preventDefault();
    e.target.classList.add('droppableArea');
}

const makeUnDroppable = (e) =>
{
    e.preventDefault();
    e.target.classList.remove('droppableArea');
}

const loadVideo = (e) =>
{
    e.preventDefault();
    let files = [];

    if(e.dataTransfer)
    {
        files=e.dataTransfer.files;
    }
    else if(e.target.files)
    {
        files=e.target.files;
    }
    else
    {
        files=
            [
                {
                    type:'video',
                    path:e.target.value
                }
            ];
    }

    for (let i=0; i<files.length; i++)
    {
        if(files[i].type.indexOf('video')>-1)
        {
            videoInfo = files[i];

            ipcRenderer.send('DiscordRPC', 'play', files[i].name, files[i].type);

            const video = document.querySelector('video');

            video.src=files[i].path;
            setTimeout(
                function()
                {
                    document.querySelector('.dropArea').classList.remove('droppableArea');
                    document.querySelector('.play:not(.hide),.pause:not(.hide)').click();
                },
                250
            );
        }
    }
}

const videoError = (message) =>
{
    const err = document.querySelector('#error');

    err.querySelector('h1').innerHTML=message;
    err.classList.remove('hide')

    setTimeout(
        function()
        {
            document.querySelector('#error').classList.remove('hidden');
        },
        10
    );
}

const closeError = () =>
{
    document.querySelector('#error').classList.add('hidden');
    setTimeout(
        function()
        {
            document.querySelector('#error').classList.add('hide');
        },
        300
    );
}

const playerClicked = (e) =>
{
    if(!e.target.id || e.target.id === 'controlContainer' || e.target.id === 'dropArea')
    {
        return;
    }

    const video = document.querySelector('#videoContainer');
    const player = document.querySelector('#playerContainer');

    switch(e.target.id)
    {
        case 'video' :
            togglePlay();
            break;
        case 'play' :
            if(!video.videoWidth)
            {
                videoError('ارور در پخش ویدیو');
                return;
            }
            video.play();
            break;
        case 'pause' :
            video.pause();
            break;
        case 'volume' :
            document.querySelector('#volRange').classList.toggle('hide');
            break;
        case 'mute' :
            video.muted=(!video.muted);
            player.classList.toggle('muted');
            break;
        case 'volRange' :
            break;
        case 'fullScreen' :
            fullScreened();
            break;
        case 'smallScreen' :
            smallScreened();
            break;
        case 'progressBarID' :
            video.currentTime = ((e.offsetX)/e.target.offsetWidth)*video.duration;
            break;
        case 'close' :
            window.close();
            break;
        case 'fileChooser' :
            document.querySelector('#chooseVideo').click();
            ipcRenderer.send('DiscordRPC', 'search');
            break;
        case 'enterLink' :
            break;
        case 'error' :
        case 'errorMessage' :
            closeError();
            break;
        default :
            console.log('some fucking function');
    }
}

