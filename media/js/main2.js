var fayFun = {
    ajaxText(a, b, c, message) {
        $('.' + a) && $('.' + a).remove();
        var div = $('<div></div>').addClass(a).text(message);
        $('.' + b).append(div);
        setTimeout(function () {
            $('.' + a) && $('.' + a).remove();
        }, c);
    },
    // scrollTopTo(top, callback) {
    //     let scrollTop = $('.content').scrollTop;
    //     let rate = 5;

    //     let funTop = function () {
    //         scrollTop = scrollTop + (top - scrollTop) / rate;

    //         if (Math.abs(scrollTop - top) <= 1) {
    //             $('.content').scrollTop = top;
    //             callback && callback();
    //             return;
    //         }
    //         $('.content').scrollTop = scrollTop;
    //         requestAnimationFrame(funTop);
    //     };
    //     funTop();
    // },
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
                    var $newArticles = $(data).find('.postlist .postlatestlist article');
                    var $newUrl = $(data).find('#load-more').attr('nextpage');
                    $('.postlist .postlatestlist').append($newArticles);
                    $('#load-more').attr('nextpage', $newUrl);
                    var pjax = new Pjax({
                        selectors: ["title", ".pjaxblock", ".menus"],
                        cacheBust: false,
                    });
                    MyApp.postMusicAdd();
                    fayFun.ajaxText('butterBar', 'body', 3000, '已载入第 ' + currentPage + ' 页');
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
        $('.menus a').each(function () {
            var href = $(this).attr('href');
            if (href === currentPath || (href.indexOf('/') !== -1 && currentPath.startsWith(href + '/'))) { // 处理子路径的情况，如href为/tag/talk，currentPath为/tag/talk/some-post  
                $(this).addClass('current');
            } else {
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
                let musicList = '/music/index.html';
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
        $('addmusic').each(function () {
            var musicName = $(this).attr('name');
            $(this).addClass('music-add');
            $(this).html('<div class="music-add-icon">🎶</div><div class="music-add-content">' + musicName + '</div><i class="iconfont icon-add"></i>');
        });
        $('.music-add').on('click', function () {
            let $this = $(this);
            let musicSrc = $this.attr('link');
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
    // toChineseNumber(num) {  
    //     const chineseNumbers = ['一', '两', '三', '四', '五', '六', '七', '八', '九', '十'];  
    //     if (num >= 1 && num <= 10 && Number.isInteger(num)) {  
    //         return chineseNumbers[num - 1];  
    //     }  
    //     return '无效的数字';  
    // },  
    // timeAgo(dateTimeString) {
    //     const dateTime = new Date(dateTimeString);
    //     const now = new Date();
    //     const diff = now - dateTime;
    //     const secondsDiff = Math.floor(diff / 1000);
    //     const minutesDiff = Math.floor(secondsDiff / 60);
    //     const hoursDiff = Math.floor(minutesDiff / 60);
    //     const daysDiff = Math.floor(hoursDiff / 24);
    //     const weeksDiff = Math.floor(daysDiff / 7);
    //     const yearsDiff = Math.floor(daysDiff / 365); 

    //     if (diff < 1000) {
    //         return '刚刚';
    //     } else if (secondsDiff < 60) {
    //         return `${MyApp.toChineseNumber(secondsDiff)}秒前`;
    //     } else if (minutesDiff < 60) {
    //         return `${MyApp.toChineseNumber(minutesDiff)}分钟前`;
    //     } else if (hoursDiff < 24) {
    //         return `${MyApp.toChineseNumber(hoursDiff)}小时前`;
    //     } else if (daysDiff < 7) {
    //         return `${MyApp.toChineseNumber(daysDiff)}天前`;
    //     } else if (weeksDiff < 52) { // 假设一年有52周  
    //         return `${MyApp.toChineseNumber(weeksDiff)}周前`;
    //     } else if (yearsDiff < 1) { // 精确到天  
    //         return `${MyApp.toChineseNumber(daysDiff)}天前`;
    //     } else if (yearsDiff < 3 && yearsDiff >= 1) {
    //         return `${MyApp.toChineseNumber(yearsDiff)}年前`;
    //     } else {
    //         return `多年前`;
    //     }
    // },
    // postdate(classname, words) {   
    //     $('.' + classname).each(function() {  
    //         var postdate = $(this).attr('datetime'); 
    //         $(this).text(MyApp.timeAgo(postdate) + words);  
    //     });  
    // },
    getLinkContent() {
        var url = '';
        $('.preview-link').on('click', function () {
            url = $(this).attr('link');
            NProgress.start();
            fetch(url, {
                method: 'GET'
            }).then(response => {
                return response.text();
            }).then(data => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(data, "text/html");
                let targetHtml = $(doc).find('article.post-normal');
                if (targetHtml) {
                    $('.post-preview').append($('<div></div>').addClass('post-preview-show'));
                    $('.post-preview-show').html("<div class='post-preview-bg post-preview-bg-in'></div>");
                    $('.post-preview-show').append($(targetHtml).prop('outerHTML'));
                    $('#toc').remove();
                    $('.post-preview-show .post-normal').addClass('scroll-y');
                    $('.post-preview-show .post-normal').addClass('post-preview-up')
                    $('body').addClass('scroll-no');
                    Prism.highlightAll();
                    fayFun.ajaxText('butterBar', 'body', 3000, '文章加载完成');
                    MyApp.postMusicAdd();
                    NProgress.done();
                    $('.post-preview-bg').on('click', function () {
                        $('.post-preview-bg').removeClass('post-preview-bg-in');
                        $('.post-preview-bg').addClass('post-preview-bg-out');
                        $('.post-preview-show .post-normal').removeClass('post-preview-up');
                        $('.post-preview-show .post-normal').addClass('post-preview-down');
                        setTimeout(function () {
                            $('.post-preview-show').remove();
                            $('body').removeClass('scroll-no');
                        }, 450);
                    });
                }
            })
        });
    },
    getInlink() {
        var url = '';
        $('inlink').each(function () {
            url = $(this).attr('link');
            fetch(url, {
                method: 'GET'
            }).then(response => {
                return response.text();
            }).then(data => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(data, "text/html");
                let postTitle = $(doc).find('.post-title h1').text();
                let postTag = $(doc).find('.post-tags').html();
                let postDate = $(doc).find('.post-date').text();
                let postContent = $(doc).find('.post-content').text();
                let targetHtml = $(doc).find('article.post-normal');
                if (postTitle) {
                    $(this).addClass('post-inlink');
                    $(this).html(`
                        <div class="post-inlink-top">
                            <div class="post-inlink-title">
                                <div class="post-inlink-link" href="${url}">${postTitle}</div>
                            </div>
                        </div>
                        <section class="post-inlink-content" style="max-height:105px;overflow:hidden;" class="post-inlink--excerpt">${postContent}</section>
                        <div class="post-inlink-meta">
                            <span class="post-inlink-tag">${postTag}</span>
                            <time class="post-inlink-date">发布于${postDate}</time>
                        </div>
                    `);
                }
                $('.post-inlink-link').on('click', function (event) {
                    event.preventDefault();
                    if (targetHtml) {
                        $('.post-preview').append($('<div></div>').addClass('post-preview-show'));
                        $('.post-preview-show').html("<div class='post-preview-bg post-preview-bg-in'></div>");
                        $('.post-preview-show').append($(targetHtml).prop('outerHTML'));
                        $('.post-preview #toc').remove();
                        $('.post-preview-show .post-normal').addClass('scroll-y');
                        $('.post-preview-show .post-normal').addClass('post-preview-up')
                        $('body').addClass('scroll-no');
                        Prism.highlightAll();
                        fayFun.ajaxText('butterBar', 'body', 3000, '文章加载完成');
                        MyApp.postMusicAdd();
                        NProgress.done();
                        $('.post-preview-bg').on('click', function () {
                            $('.post-preview-bg').removeClass('post-preview-bg-in');
                            $('.post-preview-bg').addClass('post-preview-bg-out');
                            $('.post-preview-show .post-normal').removeClass('post-preview-up');
                            $('.post-preview-show .post-normal').addClass('post-preview-down');
                            setTimeout(function () {
                                $('.post-preview-show').remove();
                                $('body').removeClass('scroll-no');
                            }, 450);
                        });
                    }
                });
            })
        });
    },
    hotmap() {
        const resultArr = [];

        function addZero(value) {
            return value < 10 ? "0" + value : value;
        }

        let apiUrl = '/api/index.html'; // 假设这是正确的 API URL  

        fetch(apiUrl, {
            method: 'GET'
        }).then(response => {
            return response.json();
        }).then(data => {
            for (let key in data.posts) {
                let date = new Date(data.posts[key].date);
                let dateFormat = `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`;
                const item = {
                    title: data.posts[key].title,
                    pubDate: dateFormat,
                };
                resultArr.push(item);
            }

            // 在这里处理分组逻辑  
            const groupedByDate = {};
            resultArr.forEach(result => {
                const Date = result.pubDate;
                if (!groupedByDate[Date]) {
                    groupedByDate[Date] = {
                        Date,
                        Num: 1,
                        Title: [result.title]
                    };
                } else {
                    groupedByDate[Date].Num++;
                    groupedByDate[Date].Title.push(result.title);
                }
            });

            // 将 groupedByDate 的值转换为数组  
            const resultList = Object.values(groupedByDate);

            var today = new Date();
            var dates = [];

            for (let i = -1; i < 59; i++) {
                let year = today.getFullYear();
                let month = today.getMonth();
                let day = today.getDate() - i;
                // 如果日期小于1，则需要调整月份和年份  
                if (day < 1) {
                    month--;
                    if (month < 0) {
                        month = 11;
                        year--;
                    }
                    day += new Date(year, month + 1, 0).getDate(); // 获取上个月的天数  
                }
                dates.unshift({
                    Date: new Date(year, month, day).toISOString().split('T')[0]
                });
            }

            function hotmapbuilding() {
                const hotmap = dates.map(objB => {
                    // 在arra中查找匹配的date  
                    const matchingObjA = resultList.find(objA => objA.Date === objB.Date);

                    // 根据是否找到匹配项来决定输出的HTML  
                    if (matchingObjA) {
                        // 如果找到匹配项，则使用arra中的value作为链接的值  
                        return `<div class="havepost tooltip" data-tooltip="${matchingObjA.Date}&#10;POST: ${matchingObjA.Num}"></div>`;
                    } else {
                        // 如果没有找到匹配项，则使用arrb中的date作为链接的文本  
                        return `<div class="nopost tooltip" data-tooltip="${objB.Date}"></div>`;
                    }
                });
                return hotmap.join('\n'); // 返回包含所有链接的字符串，每个链接用换行符分隔  
            }
            $('#hotmap').html(hotmapbuilding());
        }).catch(err => {
            fayFun.ajaxText('butterBar', 'body', 3000, '热力图加载错误！');
        });
    },
    postToc() {
        const headings = $('.post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6');
        if (headings.length === 0) {
            $('#toc').append(
                `
                <div class="catalog">
                    没有目录
                </div>
                `
            );
        } else {
            for (let heading of headings) {
                const headingLevel = heading.tagName.toLowerCase();
                const $heading = $(heading);
                const headingName = $heading.text().trim();
                const anchorName = $heading.attr('id');
                $('#toc').append(
                    `
                    <div class="catalog catalog-${headingLevel}" name="${anchorName}">
                        <a href="#${anchorName}">${headingName}</a>
                    </div>
                    `
                );
            }
        }
        const catalogTrack = () => {
            let $currentHeading = $('h1');
            for (let heading of $('h1,h2,h3,h4,h5,h6')) {
                const $heading = $(heading);
                if ($heading.offset().top - $(document).scrollTop() > 20) {
                    break;
                }
                $currentHeading = $heading;
            }
            const anchorName = $currentHeading.attr('id');
            const $catalog = $(`.catalog[name="${anchorName}"]`);
            if (!$catalog.hasClass('catalog-active')) {
                $('.catalog-active').removeClass('catalog-active');
                $catalog.addClass('catalog-active');
            }
        };
        $(window).scroll(catalogTrack);
    },
    updateClock() {
        updateClock = {
            nowClock() {
                const now = new Date(); // 获取当前时间  

                // 获取年、月、日、小时、分钟、秒和星期  
                let hours = now.getHours();
                let minutes = now.getMinutes();
                let seconds = now.getSeconds();
                let weekDay = now.getDay(); // 星期几，0（周日）到6（周六）  

                // 格式化时间  
                hours = hours < 10 ? '0' + hours : hours;
                minutes = minutes < 10 ? '0' + minutes : minutes;
                seconds = seconds < 10 ? '0' + seconds : seconds;

                // 格式化星期几  
                const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                let weekDayStr = weekDays[weekDay];

                // 拼接时间字符串  
                const dateTimeString = `${weekDayStr} ${hours}:${minutes}:${seconds}`;
                $('#clock').text(dateTimeString);
            }
        }
        setInterval(updateClock.nowClock, 1000);
    },
    postTopMove() {
        let scrollContainer = $('.posttoplist');
        let currentScroll = 0; // 获取当前滚动位置  
        let scrollAmount = $('.top').outerWidth(true) * 3 + 18; // 指定向左滚动的距离  
        $('.posttop .icon-left').click(function () {
            console.log(currentScroll, scrollAmount);
            // 滚动到新的位置  
            currentScroll = Math.max(currentScroll - scrollAmount, 0);
            scrollContainer.animate({
                scrollLeft: currentScroll
            }, 1000);
        });
        $('.posttop .icon-right').click(function () {
            console.log(currentScroll, scrollAmount);
            // 滚动到新的位置  
            currentScroll = Math.min(currentScroll + scrollAmount, scrollContainer[0].scrollWidth - scrollContainer.width());
            scrollContainer.animate({
                scrollLeft: currentScroll
            }, 1000);
        });
    },
    headerShow() {
        $(window).scroll(function () {
            var scroll = $(window).scrollTop();
            if (scroll >= 50) {
                $('.header').addClass('headershow');
            } else {
                $('.header').removeClass('headershow');
            }
        });
    },
    menusHover() {
        var $menus = $('.menus');
        var $menuItems = $('.menus a');
        var $menusHover = $('.menus-hover');
        $menuItems.mouseenter(function () {
            var $this = $(this);
            $menusHover.css({
                position: 'absolute',
                left: $(this).position().left,
                top: 0,
                width: $(this).outerWidth(),
                height: '100%',
                'border-radius': '5px',
                background: 'var(--fy-menu-hover)',
                transition: 'all 0.3s',
            });
        });
        $menus.mouseleave(function () {
            $menusHover.removeAttr('style');
        });
    },
    rssReader(n) {
        var rssList = $('.rsslist-item');
        var rssLink = rssList.eq(n - 1).attr('data-rsslink');
        var rssArr = [];
        rssList.eq(n - 1).addClass('current')
        var delay = 0;
        $('.rsslist-content').append('<div class="Loading"><div class="circle-side"></div><p>正在努力加载中</p></div>');
        $.ajax({
            type: "GET",
            url: rssLink,
            dataType: "xml",
            success: function (xml) {
                $('.Loading').remove();
                $(xml).find('item').each(function () {
                    var rssitem = {
                        title: $(this).find('title').text(),
                        link: $(this).find('link').text(),
                        description: $(this).find('description').text(),
                    }
                    rssArr.push(rssitem);
                });
                rssArr.forEach((item, index) => {
                    var rssItem = $('<div class="rss-item" link="' + item.link + '" num="' + index + '"><div class="num">' + (index + 1).toString().padStart(3, '0') + '</div><div class="title">' + item.title + '</div></div>');
                    rssItem.css('animation-delay', delay + 's');
                    $('.rsslist-content').attr('data-link', rssLink);
                    $('.rsslist-content').append(rssItem);
                    delay += 0.2; // 每个元素之间的延迟递增 
                    $('.rss-item').attr('num',index).on('click', function () {
                        $('.post-preview').append('<div class="Loading"><div class="circle-side"></div><p>正在努力加载中</p></div>');
                        var rssItemContent = $('<article class="post-normal"><div class="post-title"><h1>' + item.title + '</h1></div><div class="post-content" itemprop="articleBody">' + item.description + '</div></article>');
                        if (item.description) {
                            $('.post-preview').append($('<div></div>').addClass('post-preview-show'));
                            $('.post-preview-show').html("<div class='post-preview-bg post-preview-bg-in'></div>");
                            $('.post-preview-show').append($(rssItemContent).prop('outerHTML'));
                            $('.post-preview-show .post-normal').addClass('scroll-y');
                            $('.post-preview-show .post-normal').addClass('post-preview-up')
                            $('body').addClass('scroll-no');
                            fayFun.ajaxText('butterBar', 'body', 3000, '文章加载完成');
                            $('.post-preview-bg').on('click', function () {
                                $('.post-preview-bg').removeClass('post-preview-bg-in');
                                $('.post-preview-bg').addClass('post-preview-bg-out');
                                $('.post-preview-show .post-normal').removeClass('post-preview-up');
                                $('.post-preview-show .post-normal').addClass('post-preview-down');
                                setTimeout(function () {
                                    $('.post-preview-show').remove();
                                    $('body').removeClass('scroll-no');
                                }, 450);
                            });
                        }
                    });
                });
                delay = 0;
            },
            error: function () {
                fayFun.ajaxText('butterBar', 'body', 3000, '订阅加载失败！');
            }
        });
        console.log(rssArr);
    }
}

MyApp.fayMusic(0);

NProgress.configure({ showSpinner: false });
NProgress.start();

$(document).on({
    'DOMContentLoaded': function () {
        var pjax = new Pjax({
            selectors: ["title", ".pjaxblock", ".menus"],
            cacheBust: false,
        });
        setTimeout(function () { $('.circle-side').hide() }, 1000);
        MyApp.postMusicAdd();
        fayFun.getNextPageUrl();
        MyApp.getLinkContent();
        MyApp.getInlink();
        fayFun.menuActive();
        MyApp.postToc();
        MyApp.hotmap();
        MyApp.updateClock();
        MyApp.postTopMove();
        MyApp.headerShow();
        MyApp.menusHover();
        MyApp.rssReader(1);
        NProgress.done();
    },
    'pjax:send': function () {
        NProgress.start();
    },
    'pjax:complete': function () {
        Prism.highlightAll();
        MyApp.postMusicAdd();
        fayFun.getNextPageUrl();
        MyApp.getLinkContent();
        MyApp.getInlink();
        fayFun.menuActive();
        MyApp.postToc();
        MyApp.hotmap();
        MyApp.updateClock();
        MyApp.postTopMove();
        MyApp.headerShow();
        MyApp.menusHover();
        MyApp.rssReader(1);
        NProgress.done();
    }
});
