  //图片预览控件
  $.fn.showPic = function (opt){
    var options = $.extend(true,{
        obtainBom: false,  //是否获取相同dom上面的资源图片
        imgBindBom : 'imgUrl', //设置图片绑定的属性，默认值为imgUrl
        bigSize:2.0,//最大放大倍数(必须大于1.0)
        pin: 0.3,//每次点击的放大频率
        imgUrls:[],       //图片地址集合（Array）
        imgUrl:'',         //单张图片（String）
        del:false,         //是否添加删除事件
        delF:null          //删除函数的回调（会返回一个对象：为当前图片的id和url）       
    },opt);
    (function (_this,opt){
        if(!_this.length) return;
        var bindBom = _this.selector;
        _this.on('click',function(){
                opt.imgUrl= $(this).attr(opt.imgBindBom) || opt.imgUrl;
            if( opt.imgUrls.length==0 && opt.obtainBom){
                opt.imgUrls=[];
                $(bindBom).each(function(index,item){
                    var imgUrls=$(item).attr(opt.imgBindBom) || '';
                    opt.imgUrls.push({url:imgUrls,id:index});
                })
            }
            if(!opt.imgUrl && opt.imgUrls.length<1) return
            new LookPic(_this,opt)
        })
    })($(this),options);
}
function LookPic (elem,opt){
    this.elem = elem;
    this.$elem = $(elem);
    this.opt= $.extend({},true,opt);
    this.imgUrl = opt.imgUrl || '';
    this.imgUrls = opt.imgUrls || [];
    this.rotate = 90;
    this.imgUrlIndex = 0;  //储存切换图片的下标
    this.imgLoad = false; //图片是否加载完成
    this.imgWidth = 0; //储存图片原始宽度
    this.size = 1.0;
    this.init();
}
//初始化控件
LookPic.prototype.init = function () {
    this.$container = $('<div class="show-pic-box" style="filter: progid:DXImageTransform.Microsoft.Gradient(startColorstr=#7F000000, endColorstr=#7F000000);background-color:rgba(0,0,0,.5);"></div>');
    this.$containerSun = $('<div style="filter: progid:DXImageTransform.Microsoft.Gradient(startColorstr=#7F000000, endColorstr=#7F000000);background-color:rgba(0,0,0,.5);" class="show-pic-box-sun"><span class="show-pic-box-close">×</span><img ondragstart="return false;" title="图片可拖动！" src="" alt="" /></div>');
    this.$left = $('<i class="icon iconfont icon-left theme"></i>');
    this.$right = $('<i class="icon iconfont icon-right theme"></i>');
    this.$loading = $('<div class="show-pic-loading"></div>');
    this.$resize = $('<div class="show-pic-resize"></div>');
    this.$big = $('<i class="icon iconfont icon-search-plus theme" title="放大"></i>');
    this.$small = $('<i class="icon iconfont icon-search-minus theme" title="缩小"></i>');
    this.$rotate = $('<i class="icon iconfont icon-shunshizhenxuanzhuan theme" title="旋转"></i>');
    this.$del = $('<i class="icon iconfont icon-del theme" title="删除"></i>');
    //初始化的时候将页面上的此dom清理掉
    if($('.show-pic-box')) $('.show-pic-box').remove();
    if($('.show-pic-box-sun')) $('.show-pic-box-sun').remove();
    this.$containerSun.append(this.$loading);
    this.$container.append(this.$containerSun);
    this.$resize.append(this.$big, this.$small, this.$rotate);
    if(this.opt.del){
        this.$resize.append(this.$del)
    }
    $(document.body).append(this.$container);
    // 数据渲染之前的关闭事件
    //关闭按钮点击事件
    var _this = this;
    this.$container.find('.show-pic-box-close').on('click', function () {
        _this.destroy();
    })

    this.lodeData();
}
//数据渲染
LookPic.prototype.lodeData = function () {
    /**分为4种情况
     * 1:imgUrl存在imgUrls不存在
     * 2：imgUrl不存在imgUrls存在
     * 3:imgUrl和imgUrls同时存在
     * 4：都不存在
     */
    if(typeof(this.imgUrl) === 'string' && this.imgUrl != '' && this.imgUrls.length ==0){//1:imgUrl存在imgUrls不存在
        var ynImg = this.isPic(this.imgUrl); //判断是否为图片格式
        if(ynImg) {
            this.$containerSun.find('img').attr('src',this.imgUrl);
            this.bindEvent(this.imgUrl);
        }else {
            this.destroy();
            return;
        }
    }else if(this.imgUrls.length>0 && this.imgUrl == '' ){ //imgUrl不存在imgUrls存在
        var imgs = [];
        for(var i=0 ; i < this.imgUrls.length ; i++){
            var ynImg = this.isPic(this.imgUrls[i].url);
            if(ynImg) imgs.push(this.imgUrls[i])
        }
        if(imgs.length > 0){
            this.$containerSun.find('img').attr('src',imgs[0].url);
            this.$containerSun.find('img').attr('picId',imgs[0].id);
            this.bindEvent(imgs);
        }else{
            this.destroy();
            return;
        }
    }else if (this.imgUrls.length > 0 && this.imgUrl && typeof(this.imgUrl) === 'string'){ //imgUrl和imgUrls同时存在
        var ynImg = this.isPic(this.imgUrl), //判断是否为图片格式
            imgs = [];
        for(var i=0 ; i < this.imgUrls.length ; i++){
            var tfImg = this.isPic(this.imgUrls[i].url);
            if(tfImg) imgs.push(this.imgUrls[i])
        }
        //同时存在不一定代表值同时有效
        if(ynImg && imgs.length > 0){ //同时都有效
            var imgsI= 0;
            for(var j=imgs.length-1 ; j >= 0 ; j--){
                imgsI++;
                if(imgs[j].url === this.imgUrl){
                    imgsI--;
                    var id = imgs[j].id
                    imgs.splice(j,1);
                    imgs.unshift({url:this.imgUrl,id:id});
                    break;
                }
            }
            if( imgsI == imgs.length){
                imgs.unshift({url:this.imgUrl,id:Math.random()});
            }
            this.$containerSun.find('img').attr('src',imgs[0].url);
            this.$containerSun.find('img').attr('picId',imgs[0].id);
            this.bindEvent(imgs);

        }else if(ynImg && imgs.length == 0){ //imgUrl有效imgUrls无效
            this.$containerSun.find('img').attr('src',this.imgUrl);
            this.bindEvent(this.imgUrl);

        }else if( !ynImg && imgs.length > 0 ){//imgUrl无效imgUrls有效
            this.$containerSun.find('img').attr('src',imgs[0].url);
            this.$containerSun.find('img').attr('picId',imgs[0].id);
            this.bindEvent(imgs);
        }else{  //都无效
            this.destroy();
            return;
        }
    }else{//都不存在
        this.destroy();
        return;
    }
}
//绑定关闭事件(数据经过过滤在这里执行)
LookPic.prototype.bindEvent = function (data) {
    var _this = this;
    //判断ie版本
    var userAgent = navigator.userAgent,
        isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1,
        fIEVersion= false;
    if(isIE){
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        fIEVersion = parseFloat(RegExp["$1"]);
    }
    //绑定事件
    this.$containerSun.find('img').on('click', function (ev) {
        _this.stopEvent(ev)
    })
    this.$resize.on('click',function(ev){
        _this.stopEvent(ev)
    })
    //放大缩小按钮事件 可放大倍数(最大放大_this.opt.bigSize倍)
    this.$big.on('click',function(ev){
        _this.stopEvent(ev)
        var bigSize = _this.opt.bigSize;
        if(_this.size > bigSize-0.01) return;
        _this.size += _this.opt.pin;
        _this.$small.css('color','inherit')
        if(_this.size > bigSize) _this.size = bigSize;
        _this.$containerSun.find('img').css({
            'width': _this.size*_this.imgWidth+'px',
            'height': _this.size*_this.imgHeight+'px'
        })
        _this.imgPosition()
        if(_this.size > bigSize-0.01) $(this).css('color','#999999')
    })
    this.$small.on('click',function(ev){
        _this.stopEvent(ev)
        if(_this.size < _this.opt.pin) return
        _this.size -= _this.opt.pin;
        _this.$big.css('color','inherit')
        if(_this.size < 0) _this.size = 0
        _this.$containerSun.find('img').css({
            'width': _this.size*_this.imgWidth+'px',
            'height': _this.size*_this.imgHeight+'px'
        })
        _this.imgPosition()
        if(_this.size < _this.opt.pin) $(this).css('color','#999999')
    })
    // 旋转事件
    this.$rotate.on('click',function(ev){
        _this.stopEvent(ev)
        if(fIEVersion && fIEVersion <9) return;
        _this.$containerSun.find('img').css({
        'transform':'rotate('+ _this.rotate +'deg)',
        '-ms-transform':'rotate('+ _this.rotate +'deg)', /* IE 9 */
        '-webkit-transform':'rotate('+ _this.rotate +'deg)', /* Safari and Chrome */
        })
        _this.imgPosition()
        _this.rotate+=90;

    })
    // 删除事件
    this.$del.on('click',function(){
        if (Object.prototype.toString.call(_this.opt.delF) === "[object Function]") {
            var id = _this.$containerSun.find('img').attr('picId')
            var urlC = _this.$containerSun.find('img').attr('src')
            _this.destroy();
            for(var dd=0;dd<data.length;dd++){
                if(data[dd].id == id){
                    data.splice(dd,1)
                }
            }
            _this.opt.delF({id:id,url:urlC})
        }
    })
    this.$containerSun.find('img').on('load', function () {
        _this.loadEvent(data);
        _this.imgLoad = true;
    })
    //ie8会因缓存原因将不执行load事件, 设置1秒延时是为了动态的判断load事件是否执行完毕如果未执行完则在这里执行
    if(fIEVersion && fIEVersion < 9){
        this.$rotate.css('cursor', 'not-allowed')//ie9不能旋转
        setTimeout(function () {
            if (!_this.imgLoad) {
                _this.loadEvent(data);
                _this.imgLoad = true;
            }
        }, 1000)
    }
    return;
}
//图片加载完成之后的事件，并设置位置
LookPic.prototype.loadEvent = function(data){
    var _this = this;
    this.$loading.css('display','none');
    //为数组的时候添加左右点击按钮
    if (typeof(data) !== 'string' && !_this.imgLoad) {
        this.$resize.prepend(this.$left, this.$right);
    }
    this.$containerSun.append(this.$resize);
    this.imgWidth = parseInt(this.$containerSun.find('img').width());
    this.imgHeight = parseInt(this.$containerSun.find('img').height());
    this.$containerSun.find('img').css({'visibility':'inherit'})
    this.imgPosition()
    // 图片的拖动事件
    this.$containerSun.find('img').on('mousedown',function (e){
        var $this = $(this);
        // 判断图片是否偏离位置旋转
        var l = 0;
        if((_this.rotate/90)%2 === 0 ){
            var imgW = _this.$containerSun.find('img').width();
            var imgH = _this.$containerSun.find('img').height();
            l = (imgW - imgH)/2

        }
        var domX = $this.offset().left - l,
            domY = $this.offset().top - $(window).scrollTop() + l,
            startX = e.clientX,
            startY = e.clientY,
            pyX = startX - domX,
            pyY = startY - domY;
        document.onmousemove = function (em) {
            var moveX = em.clientX - pyX;
            var moveY = em.clientY - pyY;
            $this.css({
                'top': moveY+'px',
                'left': moveX+'px'
            })
        }
        //鼠标释放事件
        document.onmouseup = function () {
            document.onmousemove = null;
            document.onmouseup = null;
        }
    })
    //鼠标释放事件
    document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
    }
    if(_this.$containerSun.find('.show-pic-clcL')){
        //设置左右切换按钮的位置以及事件
        _this.$left.on('click',function(e){
            if(!e.isPropagationStopped()) {
                _this.imgUrlIndex--;
                if (_this.imgUrlIndex < 0) {
                    _this.imgUrlIndex = (data.length) - 1;
                }
                _this.slideChange(data)
            }
            _this.stopEvent(e)
        })
        _this.$right.on('click',function(e){
            if(!e.isPropagationStopped()) {
                _this.imgUrlIndex++;
                if (_this.imgUrlIndex > (data.length) - 1) {
                    _this.imgUrlIndex = 0;
                }
                _this.slideChange(data)
            }
            _this.stopEvent(e)
        })
    }
    // 滚轮事件（放大缩小）
    _this.mousewheel(_this.$containerSun.find('img')[0],big,small)
    function big(){
        var nowWidth = _this.$containerSun.find('img').innerWidth();
        if (nowWidth >  _this.imgWidth*_this.opt.bigSize) {
            _this.size = _this.opt.bigSize;
            _this.$big.css('color','#999999')
            return
        }
        _this.$big.css('color','inherit')
        _this.$small.css('color','inherit')
        _this.size = nowWidth / _this.imgWidth;
        var zoomHeight = _this.$containerSun.find('img').innerHeight() * 1.03;
        var zoomWidth = _this.$containerSun.find('img').innerWidth() * 1.03;
        _this.$containerSun.find('img').css({
            height: zoomHeight + "px",
            width: zoomWidth + "px"
        })
    }
    function small(){
        var nowWidth = _this.$containerSun.find('img').innerWidth();
        if (nowWidth < _this.imgWidth*_this.opt.pin) {
            _this.size = _this.opt.pin;
            _this.$small.css('color','#999999')
            return
        }
        _this.$small.css('color','inherit')
        _this.$big.css('color','inherit')
        _this.size = nowWidth / _this.imgWidth;
        var zoomHeight = _this.$containerSun.find('img').innerHeight() / 1.03;
        var zoomWidth = _this.$containerSun.find('img').innerWidth() / 1.03;
        _this.$containerSun.find('img').css({
            height: zoomHeight + "px",
            width: zoomWidth + "px"
        })
    }
}
// 设置图片位置
LookPic.prototype.imgPosition = function(){
    var w = this.$containerSun.find('img').width(),
        h = this.$containerSun.find('img').height(),
        dw = document.body.clientWidth,
        dh = document.documentElement.clientHeight,
        left = (dw - w)/2 + 'px',
        top = (dh - h)/2 + 'px';
    this.$containerSun.find('img').css({
        'top': top,
        'left': left
    })
}
// 左右切换后的事件
LookPic.prototype.slideChange = function(data){
    var _this = this;
    // 解决切换图片闪动的问题
    _this.$containerSun.find('img').css({
        top:'50%',
        left:'50%',
        'transform': 'translate(-50%,-50%)',
        '-ms-transform': 'translate(-50%,-50%)',
        '-webkit-transform': 'translate(-50%,-50%)'
    })
    _this.$loading.css('display','block');
    _this.$containerSun.find('img').attr('src','')
    _this.$containerSun.find('img').attr('src', data[_this.imgUrlIndex].url);
    _this.$containerSun.find('img').attr('picId', data[_this.imgUrlIndex].id);
    _this.size = 1.0
    _this.$containerSun.find('img').on('load',function(){
        _this.$loading.css('display','none');
        $(this).css({
            width:'auto',
            height:'auto',
            'transform': 'inherit',
            '-ms-transform': 'inherit',
            '-webkit-transform': 'inherit'
        })
        _this.$big.css('color','inherit')
        _this.$small.css('color','inherit')
        _this.imgWidth = parseInt(_this.$containerSun.find('img').width());
        _this.imgHeight = parseInt(_this.$containerSun.find('img').height());
        _this.imgPosition()
    })
}

// 滚轮放大缩小事件
LookPic.prototype.mousewheel = function(obj, upfun, downfun){
    var _this = this;
    if (document.attachEvent) {
        obj.attachEvent("onmousewheel", scrollFn)
    } else {
        if (document.addEventListener) {
            obj.addEventListener("mousewheel", scrollFn, false);
            obj.addEventListener("DOMMouseScroll", scrollFn, false)
        }
    }
    function scrollFn(e) {
        var ev = e || window.event;
        var dir = ev.wheelDelta || ev.detail;
        if (ev.preventDefault) {
            ev.preventDefault()
        } else {
            ev.returnValue = false
        }
        if (dir == -3 || dir == 120) {
            upfun()
        } else {
            downfun()
        }
    _this.imgPosition();
    }
}
/**
 * 判断是否为图片
 */
LookPic.prototype.isPic = function (url){ //查看是否为图片格式
    if(url){
        var urls = url.split('.'),
            length = urls.length,
            hz = urls[length-1] || '';
        hz = hz.toUpperCase();
        if(hz === 'GIF' || hz === 'JPEG' || hz === 'PNG' || hz === 'JPG' || hz === 'BMP' ){
            return true;
        }
        return false;
    }
    return false;
}
/**
 * 阻止冒泡事件
 */
LookPic.prototype.stopEvent = function(ev){
    ev = ev || window.event;
    if(ev.stopPropagation) ev.stopPropagation();
    else ev.cancelBubble = true;
    return false;
}
/**
 * 销毁控件
 */
LookPic.prototype.destroy = function(){
    if(this.$container.length>0){
        this.$container.remove();
        return;
    }
};