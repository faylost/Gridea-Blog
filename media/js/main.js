//pjax 刷新
var pjax = new Pjax({
    selectors: [
        "title",
        ".post",
        ".header-block",
        "#nav-menu",
        "#load-more",
    ],
    cacheBust: false,
});

// var id = 1;
// $(".post-content").children("h1,h2,h3,h4,h5,h6").each(function () {
//     // .content 为正文容器的 class，根据自己的情况修改
//     var hyphenated = "anchor-" + id;
//     $(this).attr('id', hyphenated);
//     id++;
// });

// tocbot.init({
//     // Where to render the table of contents.
//     tocSelector: '.toc',
//     // Where to grab the headings to build the table of contents.
//     contentSelector: '.post-content',
//     // Which headings to grab inside of the contentSelector element.
//     headingSelector: 'h1, h2, h3, h4, h5, h6',
//     positionFixedSelector: ".toc",
// });

var fayFun = {
    ajaxText(a, b, c, message) {
        $('.' + a) && $('.' + a).remove();
        var div = $('<div></div>').addClass(a).text(message);
        $('.' + b).append(div);
        setTimeout(function () {
            $('.' + a) && $('.' + a).remove();
        }, c);
    },
    scrollTopTo(top, callback) {
        let scrollTop = $('.content').scrollTop;
        let rate = 5;

        let funTop = function () {
            scrollTop = scrollTop + (top - scrollTop) / rate;

            if (Math.abs(scrollTop - top) <= 1) {
                $('.content').scrollTop = top;
                callback && callback();
                return;
            }
            $('.content').scrollTop = scrollTop;
            requestAnimationFrame(funTop);
        };
        funTop();
    },
    getNextPageUrl() {
        var nextUrl = $('#load-more').attr('nextpage'); 
        if (!nextUrl) {
            $('#load-more').attr('disabled', true);
            $('#load-more').text('没有更多了');
        } else {
            var currentPage = nextUrl.match(/\/(\d+)$/)[1];
        }

        $('#load-more').on('click', function () {
            if ($(this).is(':disabled')) {
                return; 
            }
            $.ajax({
                url: nextUrl,
                type: 'GET',
                dataType: 'html', 
                success: function (data) {
                    var $newArticles = $(data).find('.post-list article');
                    var $newUrl = $(data).find('#load-more').attr('nextpage');
                    $('#load-more').before($newArticles);
                    $('#load-more').attr('nextpage',$newUrl);
                    fayFun.ajaxText('butterBar', 'body', 3000, '已载入第 '+currentPage+' 页');
                    if (!$newUrl) {
                        $('#load-more').attr('disabled', true);
                        $('#load-more').text('没有更多了');
                    }
                },
                error: function () {
                    fayFun.ajaxText('butterBar', 'body', 3000, '页面载入错误');
                }
            });
        });
    },
    menuActive() {
        let currentPath = window.location.pathname;
        $('#nav-menu a').each(function() {  
            // 获取a标签的href属性  
            var href = $(this).attr('href');  
      
            // 比较href与当前页面的pathname  
            if (href === currentPath || // 完整匹配  
                (href.indexOf('/') !== -1 && currentPath.startsWith(href + '/'))) { // 处理子路径的情况，如href为/tag/talk，currentPath为/tag/talk/some-post  
                // 如果匹配，则添加class="current"  
                $(this).addClass('current');  
            } else {  
                // 如果不匹配且之前已添加current类，则移除它  
                $(this).removeClass('current');  
            }  
        });  
    },
};

var MyApp = {
    fayMusic(i) {
        let musicFlag = i;
        let musicInit = true;
        fayMusic = {
            openMusic() {
                let openBtn = [$('.icon-playlist'), $('.play-switch')];
                let closeBtn = $('.music-sidebar-switch');
                let music = $('.music-sidebar');
                let playBtn = $('.play-switch'); 
                openBtn.forEach(function (btn) {
                    btn.on('click', function () {
                        switch (musicFlag) { //0为初始化，1为停止，2为播放
                            case 0:
                                music.addClass('show');
                                fayMusic.getMusic();
                                musicFlag = 1;
                                break;
                            case 1:
                                music.removeClass('show');
                                musicFlag = 2;
                                break;
                            case 2:
                                music.addClass('show');
                                musicFlag = 1;
                                break;
                        }
                    });
                });
                closeBtn.on('click', function () {
                    music.removeClass('show');
                    musicFlag = 2;
                });
            },
            getMusic() {
                let musicList = '/media/music/music.json';
                fetch(musicList, {
                    method: 'GET'
                }).then(response => {
                    fayFun.ajaxText('music-massage', 'minimusic-block', 1500, '正在加载数据，请稍候~');
                    return response.json();
                }).then(data => {
                    $('.music-massage').remove();
                    player = new cplayer({
                        element: document.getElementById('musicApp'),
                        width: '100%',
                        showPlaylist: true,
                        showPlaylistButton: false,
                        playmode: 'listrandom',
                        playlist: data,
                    });
                    if (data) {
                        fayMusic.musicName();
                        fayMusic.showMusic();
                        fayMusic.playMusic();
                    }
                }).catch(err => {
                    fayFun.ajaxText('music-massage', 'minimusic-block', 1500, '没有获取到音乐数据~');
                });
            },
            musicName() {
                let box = $('.minimusic-title');
                let fengMian = $('.fengmian');
                let defaultText = box.text();
                let defaultImg = fengMian.css('background-image');
                player.on('started', cloneEle);
                player.on('play', cloneEle);
                player.on('pause', function () {
                    box.text(defaultText);
                    fengMian.css('background-image', defaultImg);
                    $('.fengmian i').css('display', 'block');
                });
                let mback = $('.icon-skip-back')
                let mnext = $('.icon-skip-forward')
                mback.on('click', function () {
                    player.prev();
                });
                mnext.on('click', function () {
                    player.next();
                });
                function cloneEle() {
                    box.empty();
                    let mTitle = $('.cp-lyric-text').text();
                    let mAuthor = $('.cp-lyric-text-sub').text();
                    let mName = mTitle.replace(new RegExp(mAuthor, 'g'), '');
                    let fengMianImg = $('.cp-poster').css('background-image');
                    $('<div>').addClass('music-name').text(mName).appendTo(box);
                    $('<div>').addClass('music-author').text(mAuthor).appendTo(box);
                    fengMian.css('background-image', fengMianImg);
                    $('.fengmian i').css('display', 'none');
                }
            },
            showMusic() {
                let stateBtn = $('.play-switch');
                let music = $('.music-sidebar');
                stateBtn.on('click', function () {
                    if (!musicInit) {
                        player.next();
                        player.play();
                        musicInit = true;
                        musicFlag = 1;
                        musicState.playState();
                    } else {
                        player.togglePlayState();
                        if (player.played) {
                            music.addClass('show');
                            musicFlag = 1;
                            musicState.playState();
                        } else {
                            music.removeClass('show');
                            musicFlag = 2;
                            musicState.stopState();
                        }
                    }
                })
                fayMusic.musicState();
            },
            playMusic() {
                let controls = $('.cp-controls');
                controls.on('click', function () {
                    if (!musicInit) {
                        player.played ? musicState.playState() : musicState.stopState();
                        musicInit = true;
                    } else {
                        player.played ? musicState.playState() : musicState.stopState();
                    }
                })

                let playlist = $('.cp-playlist');
                playlist.on('click', function () {
                    if (!musicInit) {
                        player.played ? musicState.playState() : musicState.stopState();
                        musicInit = true;
                    } else {
                        player.played ? musicState.playState() : musicState.stopState();
                    }

                })
                fayMusic.musicState();
            },
            musicState() {
                let userImg = $('.fengmian');
                let musicBtn = $('.icon-playlist');
                let musicIcon = $('.play-switch');
                let bg = $('.bg');
                musicState = {
                    playState() {
                        fayFun.ajaxText('music-massage', 'minimusic-block', 1500, '正在播放了哦~');
                        if (userImg.hasClass('img-rotate')) {
                            userImg.removeClass('animation-stop');
                        } else {
                            userImg.addClass('img-rotate');
                        }

                        /*  musicJump(musicBtn);
                        musicJump(bg);

                        function musicJump(ele) {
                            if (ele.classList.contains('music-jump')) {
                                ele.classList.remove('animation-stop');
                            } else {
                                ele.classList.add('music-jump');
                            }
                            ele.classList.add('music-jump');
                        } */

                        musicIcon.addClass('icon-pause');
                        musicIcon.removeClass('icon-play');
                    },

                    stopState() {
                        userImg.addClass('animation-stop');
                        musicBtn.addClass('animation-stop');
                        //bg.classList.addClass('animation-stop');
                        musicIcon.removeClass('icon-pause');
                        musicIcon.addClass('icon-play');
                    }
                }
            },
            musicAdd(data, ele) {
                setTimeout(function () {
                    let nameArr = [];
                    for (let a of player.playlist) {
                        nameArr.push(a.name);
                    }
                    if (nameArr.includes(data.name)) {
                        musicState.playState();
                        fayFun.ajaxText('music-massage', 'minimusic-block', 1500, '请不要重复添加~');
                        player.to(nameArr.indexOf(data.name)); 
                        $(ele).find('.icon-add').css('opacity', '0.2');
                    } else {
                        musicState.playState();
                        if (!musicInit) {
                            musicFlag = 1;
                            player.add(data);
                            player.to(player.playlist.length);
                            player.play();
                            musicInit = true;
                        } else {
                            musicFlag = 1;
                            player.add(data);
                            player.to(player.playlist.length);
                            player.play();
                        }

                        fayFun.ajaxText('music-massage', 'minimusic-block', 1500, '正在播放了哦~');
                        $(ele).find('.icon-add').css('opacity', '0.2');
                    }
                }, 600);
                fayMusic.musicState();
            }
        }
        fayMusic.openMusic();
    },
    postMusicAdd() {
        $('.music-add').on('click', function () {
            let $this = $(this);
            let musicSrc = $this.attr('src');
            let musicPoster = $this.attr('poster');
            let music163 = $this.attr('add163');
            let musicName = $this.find('.music-add-content').text();

            let fetchData = () => {
                if (music163) {
                    let musicApiUrl = 'https://v.iarc.top/?type=song&id=' + music163;
                    return fetch(musicApiUrl, {
                        method: 'GET'
                    }).then(response => {
                        fayFun.ajaxText('music-massage', 'minimusic-block', 1500, '正在加载数据，请稍候~');
                        return response.json();
                    }).then(data => {
                        return {
                            src: data[0].url,
                            name: data[0].name,
                            artist: data[0].artist,
                            poster: data[0].pic,
                            lyric: data[0].lrc,
                        };
                    })
                        .catch(error => {
                            fayFun.ajaxText('music-massage', 'minimusic-block', 1500, '没有获取到音乐数据~');
                        });
                } else {
                    return Promise.resolve({
                        src: musicSrc,
                        name: musicName.split('-')[0].trim(),
                        artist: musicName.split('-')[1].trim(),
                        poster: musicPoster,
                    });
                }
            };

            fetchData().then(musicDate => {
                fayFun.ajaxText('music-massage', 'minimusic-block', 1500, '正在加载数据，请稍候~');
                if ($('.music-sidebar').hasClass('show')) {
                    fayMusic.musicAdd(musicDate, $this); // 使用$this[0]来获取原始DOM元素  
                } else {
                    $('.play-switch').click();
                    fayMusic.musicAdd(musicDate, $this);
                }
            });
        });
    },
    toChineseNumber(num) {  
        const chineseNumbers = ['一', '两', '三', '四', '五', '六', '七', '八', '九', '十'];  
        if (num >= 1 && num <= 10 && Number.isInteger(num)) {  
            return chineseNumbers[num - 1];  
        }  
        return '无效的数字';  
    },  
    timeAgo(dateTimeString) {
        const dateTime = new Date(dateTimeString);
        const now = new Date();
        const diff = now - dateTime;
        const secondsDiff = Math.floor(diff / 1000);
        const minutesDiff = Math.floor(secondsDiff / 60);
        const hoursDiff = Math.floor(minutesDiff / 60);
        const daysDiff = Math.floor(hoursDiff / 24);
        const weeksDiff = Math.floor(daysDiff / 7);
        const yearsDiff = Math.floor(daysDiff / 365); 

        if (diff < 1000) {
            return '刚刚';
        } else if (secondsDiff < 60) {
            return `${MyApp.toChineseNumber(secondsDiff)}秒前`;
        } else if (minutesDiff < 60) {
            return `${MyApp.toChineseNumber(minutesDiff)}分钟前`;
        } else if (hoursDiff < 24) {
            return `${MyApp.toChineseNumber(hoursDiff)}小时前`;
        } else if (daysDiff < 7) {
            return `${MyApp.toChineseNumber(daysDiff)}天前`;
        } else if (weeksDiff < 52) { // 假设一年有52周  
            return `${MyApp.toChineseNumber(weeksDiff)}周前`;
        } else if (yearsDiff < 1) { // 精确到天  
            return `${MyApp.toChineseNumber(daysDiff)}天前`;
        } else if (yearsDiff < 3 && yearsDiff >= 1) {
            return `${MyApp.toChineseNumber(yearsDiff)}年前`;
        } else {
            return `多年前`;
        }
    },
    postdate(classname, words) {   
        $('.' + classname).each(function() {  
            var postdate = $(this).attr('datetime'); 
            $(this).text(MyApp.timeAgo(postdate) + words);  
        });  
    },
    getLinkContent() {
        $('.post-preview-link').click(function (event) {
            event.preventDefault();  
            let url = $(this).attr('href'); 
            fetch(url, {
                method: 'GET'
            }).then(response => {
                fayFun.ajaxText('butterBar', 'body', 3000, '正在加载文章');
                return response.text(); 
            }).then(data => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(data, "text/html");
                let targetHtml = $(doc).find('article.post-normal');
                if (targetHtml) {
                    $('.post-preview').append($('<div></div>').addClass('post-preview-show'));
                    $('.post-preview-show').html("<div class='post-preview-show-top'><a class='linkout' target='_blank' href=" + url + ">新标签页打开</a><i class='iconfont icon-close'></i></div>");
                    $('.post-preview-show').append($(targetHtml).prop('outerHTML'));
                    fayFun.ajaxText('butterBar', 'body', 3000, '文章加载完成');
                    MyApp.postdate("post-date", "发布");
                    MyApp.postMusicAdd();
                    $('.post-preview-show').find('.icon-close').on('click', function () {
                        $('.post-preview-show').remove();
                    });
                }
            })
                .catch(error => {
                    fayFun.ajaxText('butterBar', 'body', 3000, '文章加载出错了');
                });
        });
    }
}

MyApp.fayMusic(0);

$(document).on({
    'DOMContentLoaded': function () {
        setTimeout(function () { $('.circle-side').hide() }, 1000);
        MyApp.postdate("list-post-date", "");
        MyApp.postdate("post-date", "发布");
        MyApp.postMusicAdd();
        fayFun.getNextPageUrl();
        MyApp.getLinkContent();
        fayFun.menuActive();
    },
    'pjax:send': function () {
        $('.circle-side').show();
    },
    'pjax:complete': function () {
        setTimeout(function () { $('.circle-side').hide() }, 1000);
        MyApp.postdate("list-post-date", "");
        MyApp.postdate("post-date", "发布");
        MyApp.postMusicAdd();
        fayFun.getNextPageUrl();
        MyApp.getLinkContent();
        fayFun.menuActive();
    }
});
