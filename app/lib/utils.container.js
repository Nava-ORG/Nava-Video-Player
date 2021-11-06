const truncate = (str, len) =>
{
    if (str.length > len && str.length > 0)
    {
        let newStr;
        newStr = str.substr(0, len);
        newStr = str.substr(0, newStr.lastIndexOf(" "));
        newStr = newStr.length > 0 ? newStr : str.substr(0,len);
        return newStr + "...";
    }
    return str;
};

exports.DiscordRPC = (event, arg, videoName, client) =>
{
    client.login({ clientId: '905808227768348682' }).catch(console.error);

    let details = 'نوآ اولین و برترین پخش کننده نماهنگ ایرانی',
        large_text = "نوآ - Nava",
        large_image = "nava";

    if (String(arg) === 'destroy')
    {
        client.on('ready', () =>
        {
            client.clearActivity()
        })
    }
    else if (String(arg) === 'ORG')
    {
        client.on('ready', () =>
        {
            client.request('SET_ACTIVITY',
                {
                    pid: process.pid,
                    activity:
                        {
                            details,
                            assets:
                                {
                                    large_image,
                                    large_text,
                                },
                            buttons:
                                [
                                    { label: "پروژه ها", url: "https://github.com/Nava-ORG" }
                                ]
                        }
                })
        })
    }
    else if (String(arg) === 'pause')
    {
        client.on('ready', () =>
        {
            client.request('SET_ACTIVITY',
                {
                    pid: process.pid,
                    activity:
                        {
                            details: `نماهنگ متوقف شده است`,
                            assets:
                                {
                                    large_image,
                                    large_text,
                                    small_text: 'ویدیو متوقف شده است',
                                    small_image: 'pause'
                                },
                            buttons:
                                [
                                    { label: "پروژه ها", url: "https://github.com/Nava-ORG" }
                                ]
                        }
                })
        })
    }
    else if (String(arg) === 'search')
    {
        client.on('ready', () =>
        {
            client.request('SET_ACTIVITY',
                {
                    pid: process.pid,
                    activity:
                        {
                            details: `در حال انتخاب برای ویدیو`,
                            assets:
                                {
                                    large_image,
                                    large_text,
                                    small_text: 'در حال انتخاب نماهنگ',
                                    small_image: 'search'
                                },
                            buttons:
                                [
                                    { label: "پروژه ها", url: "https://github.com/Nava-ORG" }
                                ]
                        }
                })
        })
    }
    else if (String(arg) === 'play')
    {
        client.on('ready', () =>
        {
            client.request('SET_ACTIVITY',
                {
                    pid: process.pid,
                    activity:
                        {
                            details: `نماهنگ در حال پخش است`,
                            state: truncate(videoName, 60),

                            assets:
                                {
                                    large_image,
                                    large_text,
                                    small_text: 'در حال نمایش ویدیو',
                                    small_image: 'play'
                                },
                            buttons:
                                [
                                    { label: "پروژه ها", url: "https://github.com/Nava-ORG" }
                                ]
                        }
                })
        })
    }
}