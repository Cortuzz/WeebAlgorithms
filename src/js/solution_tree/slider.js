/**
 * ChiefSlider by Itchief v2.0.0 (https://github.com/itchief/ui-components/tree/master/simple-adaptive-slider)
 * Copyright 2020 - 2021 Alexander Maltsev
 * Licensed under MIT (https://github.com/itchief/ui-components/blob/master/LICENSE)
 */

(function() {
    if (typeof window.CustomEvent === 'function') return false;
    function CustomEvent(event, params) {
        params = params || {bubbles: false, cancelable: false, detail: null};
        var e = document.createEvent('CustomEvent');
        e.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return e;
    }
    window.CustomEvent = CustomEvent;
})();

var WRAPPER_SELECTOR = '.slider__wrapper';
var ITEMS_SELECTOR = '.slider__items';
var ITEM_SELECTOR = '.slider__item';
var CONTROL_CLASS = 'slider__control';

/* var ITEM_CLASS_ACTIVE = 'slider__item_active';
var CONTROL_SELECTOR = '.slider__control';
var CONTROL_CLASS_SHOW = 'slider__control_show';
// индикаторы
var INDICATOR_WRAPPER_ELEMENT = 'ol';
var INDICATOR_WRAPPER_CLASS = 'slider__indicators';
var INDICATOR_ITEM_ELEMENT = 'li';
var INDICATOR_ITEM_CLASS = 'slider__indicator';
var INDICATOR_ITEM_CLASS_ACTIVE = 'slider__indicator_active';
// порог для переключения слайда (40%)
var POS_THRESHOLD = 40;
// класс для отключения transition
var TRANSITION_NONE = 'transition-none';*/

var SELECTOR_PREV = '.slider__control[data-slide="prev"]';
var SELECTOR_NEXT = '.slider__control[data-slide="next"]';
var SELECTOR_INDICATOR = '.slider__indicators>li';
var SLIDER_TRANSITION_OFF = 'slider_disable-transition';
var CLASS_CONTROL_HIDE = 'slider__control_hide';
var CLASS_ITEM_ACTIVE = 'slider__item_active';
var CLASS_INDICATOR_ACTIVE = 'active';

function ChiefSlider(selector, config) {
    // элементы слайдера
    var $root = typeof selector === 'string' ?
        document.querySelector(selector) : selector;
    this._$root = $root;
    this._$wrapper = $root.querySelector(WRAPPER_SELECTOR);
    this._$items = $root.querySelector(ITEMS_SELECTOR);
    this._$itemList = $root.querySelectorAll(ITEM_SELECTOR);
    this._$controlPrev = $root.querySelector(SELECTOR_PREV);
    this._$controlNext = $root.querySelector(SELECTOR_NEXT);
    this._$indicatorList = $root.querySelectorAll(SELECTOR_INDICATOR);
    // экстремальные значения слайдов
    this._minOrder = 0;
    this._maxOrder = 0;
    this._$itemWithMinOrder = null;
    this._$itemWithMaxOrder = null;
    this._minTranslate = 0;
    this._maxTranslate = 0;
    // направление смены слайдов (по умолчанию)
    this._direction = 'next';
    // determines whether the position of item needs to be determined
    this._balancingItemsFlag = false;
    this._activeItems = [];
    // текущее значение трансформации
    this._transform = 0;
    // swipe параметры
    this._hasSwipeState = false;
    this.__swipeStartPos = 0;
    // slider properties
    this._transform = 0; // текущее значение трансформации
    this._intervalId = null;
    // configuration of the slider
    this._config = {
        loop: true,
        autoplay: false,
        interval: 5000,
        refresh: true,
        swipe: true,
    };
    for (var key in config) {
        if (this._config.hasOwnProperty(key)) {
            this._config[key] = config[key];
        }
    }
    // create some constants
    var $itemList = this._$itemList;
    var widthItem = $itemList[0].offsetWidth;
    var widthWrapper = this._$wrapper.offsetWidth;
    var itemsInVisibleArea = Math.round(widthWrapper / widthItem);
    // initial setting properties
    this._widthItem = widthItem;
    this._widthWrapper = widthWrapper;
    this._itemsInVisibleArea = itemsInVisibleArea;
    this._transformStep = 100 / itemsInVisibleArea;
    // initial setting order and translate items
    for (var i = 0, length = $itemList.length; i < length; i++) {
        $itemList[i].dataset.index = i;
        $itemList[i].dataset.order = i;
        $itemList[i].dataset.translate = 0;
        if (i < itemsInVisibleArea) {
            this._activeItems.push(i);
        }
    }
    if (this._config.loop) {
        // перемещаем последний слайд перед первым
        var count = $itemList.length - 1;
        var translate = -$itemList.length * 100;
        $itemList[count].dataset.order = -1;
        $itemList[count].dataset.translate = -$itemList.length * 100;
        $itemList[count].style.transform = 'translateX(' + translate + '%)';
        this.__refreshExtremeValues();
    } else {
        if (this._$controlPrev) {
            this._$controlPrev.classList.add(CLASS_CONTROL_HIDE);
        }
    }
    this._setActiveClass();
    this._addEventListener();
    this._updateIndicators();
    this._autoplay();
}

// подключения обработчиков событий для слайдера
ChiefSlider.prototype._addEventListener = function() {
    var $root = this._$root;
    var $items = this._$items;
    var config = this._config;
    function onClick(e) {
        var $target = e.target;
        this._autoplay('stop');
        if ($target.classList.contains(CONTROL_CLASS)) {
            e.preventDefault();
            this._direction = $target.dataset.slide;
            this._move();
        } else if ($target.dataset.slideTo) {
            var index = parseInt($target.dataset.slideTo);
            this._moveTo(index);
        }
        if (this._config.loop) {
            this._autoplay();
        }
    }
    function onMouseEnter(e) {
        this._autoplay('stop');
    }
    function onMouseLeave(e) {
        this._autoplay();
    }
    function onTransitionStart() {
        if (this._balancingItemsFlag) {
            return;
        }
        this._balancingItemsFlag = true;
        window.requestAnimationFrame(this._balancingItems.bind(this));
    }
    function onTransitionEnd() {
        this._balancingItemsFlag = false;
    }
    function onResize() {
        window.requestAnimationFrame(this._refresh.bind(this));
    }
    function onSwipeStart(e) {
        this._autoplay('stop');
        var event = e.type.search('touch') === 0 ? e.touches[0] : e;
        this._swipeStartPos = event.clientX;
        this._hasSwipeState = true;
    }
    function onSwipeEnd(e) {
        if (!this._hasSwipeState) {
            return;
        }
        var event = e.type.search('touch') === 0 ? e.changedTouches[0] : e;
        var diffPos = this._swipeStartPos - event.clientX;
        if (diffPos > 50) {
            this._direction = 'next';
            this._move();
        } else if (diffPos < -50) {
            this._direction = 'prev';
            this._move();
        }
        this._hasSwipeState = false;
        if (this._config.loop) {
            this._autoplay();
        }
    }
    function onDragStart(e) {
        e.preventDefault();
    }
    function onVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            this._autoplay('stop');
        } else if (document.visibilityState === 'visible') {
            if (this._config.loop) {
                this._autoplay();
            }
        }
    }

    $root.addEventListener('click', onClick.bind(this));
    $root.addEventListener('mouseenter', onMouseEnter.bind(this));
    $root.addEventListener('mouseleave', onMouseLeave.bind(this));
    // on resize
    if (config.refresh) {
        window.addEventListener('resize', onResize.bind(this));
    }
    // on transitionstart and transitionend
    if (config.loop) {
        $items.addEventListener('transition-start', onTransitionStart.bind(this));
        $items.addEventListener('transitionend', onTransitionEnd.bind(this));
    }
    // on touchstart and touchend
    if (config.swipe) {
        $root.addEventListener('touchstart', onSwipeStart.bind(this));
        $root.addEventListener('mousedown', onSwipeStart.bind(this));
        document.addEventListener('touchend', onSwipeEnd.bind(this));
        document.addEventListener('mouseup', onSwipeEnd.bind(this));
    }
    $root.addEventListener('dragstart', onDragStart.bind(this));
    // при изменении активности вкладки
    document.addEventListener('visibilitychange', onVisibilityChange.bind(this));
};

// update values of extreme properties
ChiefSlider.prototype.__refreshExtremeValues = function() {
    var $itemList = this._$itemList;
    this._minOrder = +$itemList[0].dataset.order;
    this._maxOrder = this._minOrder;
    this._$itemByMinOrder = $itemList[0];
    this._$itemByMaxOrder = $itemList[0];
    this._minTranslate = +$itemList[0].dataset.translate;
    this._maxTranslate = this._minTranslate;
    for (var i = 0, length = $itemList.length; i < length; i++) {
        var $item = $itemList[i];
        var order = +$item.dataset.order;
        if (order < this._minOrder) {
            this._minOrder = order;
            this._$itemByMinOrder = $item;
            this._minTranslate = +$item.dataset.translate;
        } else if (order > this._maxOrder) {
            this._maxOrder = order;
            this._$itemByMaxOrder = $item;
            this._maxTranslate = +$item.dataset.translate;
        }
    }
};

// update position of item
ChiefSlider.prototype._balancingItems = function() {
    if (!this._balancingItemsFlag) {
        return;
    }
    var $wrapper = this._$wrapper;
    var $wrapperClientRect = $wrapper.getBoundingClientRect();
    var widthHalfItem = $wrapperClientRect.width / this._itemsInVisibleArea / 2;
    var count = this._$itemList.length;
    var translate;
    var clientRect;
    if (this._direction === 'next') {
        var wrapperLeft = $wrapperClientRect.left;
        var $min = this._$itemByMinOrder;
        translate = this._minTranslate;
        clientRect = $min.getBoundingClientRect();
        if (clientRect.right < wrapperLeft - widthHalfItem) {
            $min.dataset.order = this._minOrder + count;
            translate += count * 100;
            $min.dataset.translate = translate;
            $min.style.transform = 'translateX('.concat(translate, '%)');
            // update values of extreme properties
            this.__refreshExtremeValues();
        }
    } else {
        var wrapperRight = $wrapperClientRect.right;
        var $max = this._$itemByMaxOrder;
        translate = this._maxTranslate;
        clientRect = $max.getBoundingClientRect();
        if (clientRect.left > wrapperRight + widthHalfItem) {
            $max.dataset.order = this._maxOrder - count;
            translate -= count * 100;
            $max.dataset.translate = translate;
            $max.style.transform = 'translateX('.concat(translate, '%)');
            // update values of extreme properties
            this.__refreshExtremeValues();
        }
    }
    // updating...
    requestAnimationFrame(this._balancingItems.bind(this));
};

// _setActiveClass
ChiefSlider.prototype._setActiveClass = function() {
    var activeItems = this._activeItems;
    var $itemList = this._$itemList;
    for (var i = 0, length = $itemList.length; i < length; i++) {
        var $item = $itemList[i];
        var index = +$item.dataset.index;
        if (activeItems.indexOf(index) > -1) {
            $item.classList.add(CLASS_ITEM_ACTIVE);
        } else {
            $item.classList.remove(CLASS_ITEM_ACTIVE);
        }
    }
};

// _updateIndicators
ChiefSlider.prototype._updateIndicators = function() {
    var $indicatorList = this._$indicatorList;
    var $itemList = this._$itemList;
    if (!$indicatorList.length) {
        return;
    }
    for (var index = 0, length = $itemList.length; index < length; index++) {
        var $item = $itemList[index];
        if ($item.classList.contains(CLASS_ITEM_ACTIVE)) {
            $indicatorList[index].classList.add(CLASS_INDICATOR_ACTIVE);
        } else {
            $indicatorList[index].classList.remove(CLASS_INDICATOR_ACTIVE);
        }
    }
};

// move slides
ChiefSlider.prototype._move = function() {
    var step = this._direction ===
    'next' ? -this._transformStep : this._transformStep;
    var transform = this._transform + step;
    if (!this._config.loop) {
        var endTransformValue =
            this._transformStep * (this._$itemList.length - this._itemsInVisibleArea);
        transform = Math.round(transform * 10) / 10;
        if (transform < -endTransformValue || transform > 0) {
            return;
        }
        this._$controlPrev.classList.remove(CLASS_CONTROL_HIDE);
        this._$controlNext.classList.remove(CLASS_CONTROL_HIDE);
        if (transform === -endTransformValue) {
            this._$controlNext.classList.add(CLASS_CONTROL_HIDE);
        } else if (transform === 0) {
            this._$controlPrev.classList.add(CLASS_CONTROL_HIDE);
        }
    }
    var activeIndex = [];
    var i = 0;
    var length;
    var index;
    var newIndex;
    if (this._direction === 'next') {
        for (i = 0, length = this._activeItems.length; i < length; i++) {
            index = this._activeItems[i];
            newIndex = ++index;
            if (newIndex > this._$itemList.length - 1) {
                newIndex -= this._$itemList.length;
            }
            activeIndex.push(newIndex);
        }
    } else {
        for (i = 0, length = this._activeItems.length; i < length; i++) {
            index = this._activeItems[i];
            newIndex = --index;
            if (newIndex < 0) {
                newIndex += this._$itemList.length;
            }
            activeIndex.push(newIndex);
        }
    }
    this._activeItems = activeIndex;
    this._setActiveClass();
    this._updateIndicators();
    this._transform = transform;
    this._$items.style.transform = 'translateX(' + transform + '%)';
    this._$items.dispatchEvent(new CustomEvent('transition-start', {bubbles: true}));
};

// _moveToNext
ChiefSlider.prototype._moveToNext = function() {
    this._direction = 'next';
    this._move();
};

// _moveToPrev
ChiefSlider.prototype._moveToPrev = function() {
    this._direction = 'prev';
    this._move();
};

// _moveTo
ChiefSlider.prototype._moveTo = function(index) {
    var $indicatorList = this._$indicatorList;
    var nearestIndex = null;
    var diff = null;
    var i;
    var length;
    for (i = 0, length = $indicatorList.length; i < length; i++) {
        var $indicator = $indicatorList[i];
        if ($indicator.classList.contains(CLASS_INDICATOR_ACTIVE)) {
            var slideTo = +$indicator.dataset.slideTo;
            if (diff === null) {
                nearestIndex = slideTo;
                diff = Math.abs(index - nearestIndex);
            } else {
                if (Math.abs(index - slideTo) < diff) {
                    nearestIndex = slideTo;
                    diff = Math.abs(index - nearestIndex);
                }
            }
        }
    }
    diff = index - nearestIndex;
    if (diff === 0) {
        return;
    }
    this._direction = diff > 0 ? 'next' : 'prev';
    for (i = 1; i <= Math.abs(diff); i++) {
        this._move();
    }
};

// _autoplay
ChiefSlider.prototype._autoplay = function(action) {
    if (!this._config.autoplay) {
        return;
    }
    if (action === 'stop') {
        clearInterval(this._intervalId);
        this._intervalId = null;
        return;
    }
    if (this._intervalId === null) {
        this._intervalId = setInterval(
            function() {
                this._direction = 'next';
                this._move();
            }.bind(this),
            this._config.interval
        );
    }
};

// _refresh
ChiefSlider.prototype._refresh = function() {
    // create some constants
    var $itemList = this._$itemList;
    var widthItem = $itemList[0].offsetWidth;
    var widthWrapper = this._$wrapper.offsetWidth;
    var itemsInVisibleArea = Math.round(widthWrapper / widthItem);

    if (itemsInVisibleArea === this._itemsInVisibleArea) {
        return;
    }

    this._autoplay('stop');

    this._$items.classList.add(SLIDER_TRANSITION_OFF);
    this._$items.style.transform = 'translateX(0)';

    // setting properties after reset
    this._widthItem = widthItem;
    this._widthWrapper = widthWrapper;
    this._itemsInVisibleArea = itemsInVisibleArea;
    this._transform = 0;
    this._transformStep = 100 / itemsInVisibleArea;
    this._balancingItemsFlag = false;
    this._activeItems = [];

    // setting order and translate items after reset
    for (var i = 0, length = $itemList.length; i < length; i++) {
        var $item = $itemList[i];
        var position = i;
        $item.dataset.index = position;
        $item.dataset.order = position;
        $item.dataset.translate = 0;
        $item.style.transform = 'translateX(0)';
        if (position < itemsInVisibleArea) {
            this._activeItems.push(position);
        }
    }

    this._setActiveClass();
    this._updateIndicators();
    window.requestAnimationFrame(
        function() {
            this._$items.classList.remove(SLIDER_TRANSITION_OFF);
        }.bind(this)
    );

    // hide prev arrow for non-infinite slider
    if (!this._config.loop) {
        if (this._$controlPrev) {
            this._$controlPrev.classList.add(CLASS_CONTROL_HIDE);
        }
        return;
    }

    // translate last item before first
    var count = $itemList.length - 1;
    var translate = -$itemList.length * 100;
    $itemList[count].dataset.order = -1;
    $itemList[count].dataset.translate = -$itemList.length * 100;
    $itemList[count].style.transform = 'translateX('.concat(translate, '%)');
    // update values of extreme properties
    this.__refreshExtremeValues();
    // calling _autoplay
    this._autoplay();
};

// public
ChiefSlider.prototype.next = function() {
    this._moveToNext();
};
ChiefSlider.prototype.prev = function() {
    this._moveToPrev();
};
ChiefSlider.prototype.moveTo = function(index) {
    this._moveTo(index);
};
ChiefSlider.prototype.refresh = function() {
    this._refresh();
};

!function(){if("function"==typeof window.CustomEvent)return!1;window.CustomEvent=function(t,i){i=i||{bubbles:!1,cancelable:!1,detail:null};var e=document.createEvent("CustomEvent");return e.initCustomEvent(t,i.bubbles,i.cancelable,i.detail),e}}();var WRAPPER_SELECTOR=".slider__wrapper",ITEMS_SELECTOR=".slider__items",ITEM_SELECTOR=".slider__item",CONTROL_CLASS="slider__control",SELECTOR_PREV='.slider__control[data-slide="prev"]',SELECTOR_NEXT='.slider__control[data-slide="next"]',SELECTOR_INDICATOR=".slider__indicators>li",SLIDER_TRANSITION_OFF="slider_disable-transition",CLASS_CONTROL_HIDE="slider__control_hide",CLASS_ITEM_ACTIVE="slider__item_active",CLASS_INDICATOR_ACTIVE="active";function ChiefSlider(t,i){var e="string"==typeof t?document.querySelector(t):t;for(var s in this._$root=e,this._$wrapper=e.querySelector(WRAPPER_SELECTOR),this._$items=e.querySelector(ITEMS_SELECTOR),this._$itemList=e.querySelectorAll(ITEM_SELECTOR),this._$controlPrev=e.querySelector(SELECTOR_PREV),this._$controlNext=e.querySelector(SELECTOR_NEXT),this._$indicatorList=e.querySelectorAll(SELECTOR_INDICATOR),this._minOrder=0,this._maxOrder=0,this._$itemWithMinOrder=null,this._$itemWithMaxOrder=null,this._minTranslate=0,this._maxTranslate=0,this._direction="next",this._balancingItemsFlag=!1,this._activeItems=[],this._transform=0,this._hasSwipeState=!1,this.__swipeStartPos=0,this._transform=0,this._intervalId=null,this._config={loop:!0,autoplay:!1,interval:5e3,refresh:!0,swipe:!0},i)this._config.hasOwnProperty(s)&&(this._config[s]=i[s]);var r=this._$itemList,a=r[0].offsetWidth,n=this._$wrapper.offsetWidth,o=Math.round(n/a);this._widthItem=a,this._widthWrapper=n,this._itemsInVisibleArea=o,this._transformStep=100/o;for(var h=0,_=r.length;h<_;h++)r[h].dataset.index=h,r[h].dataset.order=h,r[h].dataset.translate=0,h<o&&this._activeItems.push(h);if(this._config.loop){var l=r.length-1,d=100*-r.length;r[l].dataset.order=-1,r[l].dataset.translate=100*-r.length,r[l].style.transform="translateX("+d+"%)",this.__refreshExtremeValues()}else this._$controlPrev&&this._$controlPrev.classList.add(CLASS_CONTROL_HIDE);this._setActiveClass(),this._addEventListener(),this._updateIndicators(),this._autoplay()}ChiefSlider.prototype._addEventListener=function(){var t=this._$root,i=this._$items,e=this._config;function s(t){this._autoplay("stop");var i=0===t.type.search("touch")?t.touches[0]:t;this._swipeStartPos=i.clientX,this._hasSwipeState=!0}function r(t){if(this._hasSwipeState){var i=0===t.type.search("touch")?t.changedTouches[0]:t,e=this._swipeStartPos-i.clientX;e>50?(this._direction="next",this._move()):e<-50&&(this._direction="prev",this._move()),this._hasSwipeState=!1,this._config.loop&&this._autoplay()}}t.addEventListener("click",function(t){var i=t.target;if(this._autoplay("stop"),i.classList.contains(CONTROL_CLASS))t.preventDefault(),this._direction=i.dataset.slide,this._move();else if(i.dataset.slideTo){var e=parseInt(i.dataset.slideTo);this._moveTo(e)}this._config.loop&&this._autoplay()}.bind(this)),t.addEventListener("mouseenter",function(t){this._autoplay("stop")}.bind(this)),t.addEventListener("mouseleave",function(t){this._autoplay()}.bind(this)),e.refresh&&window.addEventListener("resize",function(){window.requestAnimationFrame(this._refresh.bind(this))}.bind(this)),e.loop&&(i.addEventListener("transition-start",function(){this._balancingItemsFlag||(this._balancingItemsFlag=!0,window.requestAnimationFrame(this._balancingItems.bind(this)))}.bind(this)),i.addEventListener("transitionend",function(){this._balancingItemsFlag=!1}.bind(this))),e.swipe&&(t.addEventListener("touchstart",s.bind(this)),t.addEventListener("mousedown",s.bind(this)),document.addEventListener("touchend",r.bind(this)),document.addEventListener("mouseup",r.bind(this))),t.addEventListener("dragstart",function(t){t.preventDefault()}.bind(this)),document.addEventListener("visibilitychange",function(){"hidden"===document.visibilityState?this._autoplay("stop"):"visible"===document.visibilityState&&this._config.loop&&this._autoplay()}.bind(this))},ChiefSlider.prototype.__refreshExtremeValues=function(){var t=this._$itemList;this._minOrder=+t[0].dataset.order,this._maxOrder=this._minOrder,this._$itemByMinOrder=t[0],this._$itemByMaxOrder=t[0],this._minTranslate=+t[0].dataset.translate,this._maxTranslate=this._minTranslate;for(var i=0,e=t.length;i<e;i++){var s=t[i],r=+s.dataset.order;r<this._minOrder?(this._minOrder=r,this._$itemByMinOrder=s,this._minTranslate=+s.dataset.translate):r>this._maxOrder&&(this._maxOrder=r,this._$itemByMaxOrder=s,this._maxTranslate=+s.dataset.translate)}},ChiefSlider.prototype._balancingItems=function(){if(this._balancingItemsFlag){var t,i=this._$wrapper.getBoundingClientRect(),e=i.width/this._itemsInVisibleArea/2,s=this._$itemList.length;if("next"===this._direction){var r=i.left,a=this._$itemByMinOrder;t=this._minTranslate,a.getBoundingClientRect().right<r-e&&(a.dataset.order=this._minOrder+s,t+=100*s,a.dataset.translate=t,a.style.transform="translateX(".concat(t,"%)"),this.__refreshExtremeValues())}else{var n=i.right,o=this._$itemByMaxOrder;t=this._maxTranslate,o.getBoundingClientRect().left>n+e&&(o.dataset.order=this._maxOrder-s,t-=100*s,o.dataset.translate=t,o.style.transform="translateX(".concat(t,"%)"),this.__refreshExtremeValues())}requestAnimationFrame(this._balancingItems.bind(this))}},ChiefSlider.prototype._setActiveClass=function(){for(var t=this._activeItems,i=this._$itemList,e=0,s=i.length;e<s;e++){var r=i[e],a=+r.dataset.index;t.indexOf(a)>-1?r.classList.add(CLASS_ITEM_ACTIVE):r.classList.remove(CLASS_ITEM_ACTIVE)}},ChiefSlider.prototype._updateIndicators=function(){var t=this._$indicatorList,i=this._$itemList;if(t.length)for(var e=0,s=i.length;e<s;e++){i[e].classList.contains(CLASS_ITEM_ACTIVE)?t[e].classList.add(CLASS_INDICATOR_ACTIVE):t[e].classList.remove(CLASS_INDICATOR_ACTIVE)}},ChiefSlider.prototype._move=function(){var t="next"===this._direction?-this._transformStep:this._transformStep,i=this._transform+t;if(!this._config.loop){var e=this._transformStep*(this._$itemList.length-this._itemsInVisibleArea);if((i=Math.round(10*i)/10)<-e||i>0)return;this._$controlPrev.classList.remove(CLASS_CONTROL_HIDE),this._$controlNext.classList.remove(CLASS_CONTROL_HIDE),i===-e?this._$controlNext.classList.add(CLASS_CONTROL_HIDE):0===i&&this._$controlPrev.classList.add(CLASS_CONTROL_HIDE)}var s,r,a,n=[],o=0;if("next"===this._direction)for(o=0,s=this._activeItems.length;o<s;o++)r=this._activeItems[o],(a=++r)>this._$itemList.length-1&&(a-=this._$itemList.length),n.push(a);else for(o=0,s=this._activeItems.length;o<s;o++)r=this._activeItems[o],(a=--r)<0&&(a+=this._$itemList.length),n.push(a);this._activeItems=n,this._setActiveClass(),this._updateIndicators(),this._transform=i,this._$items.style.transform="translateX("+i+"%)",this._$items.dispatchEvent(new CustomEvent("transition-start",{bubbles:!0}))},ChiefSlider.prototype._moveToNext=function(){this._direction="next",this._move()},ChiefSlider.prototype._moveToPrev=function(){this._direction="prev",this._move()},ChiefSlider.prototype._moveTo=function(t){var i,e,s=this._$indicatorList,r=null,a=null;for(i=0,e=s.length;i<e;i++){var n=s[i];if(n.classList.contains(CLASS_INDICATOR_ACTIVE)){var o=+n.dataset.slideTo;null===a?(r=o,a=Math.abs(t-r)):Math.abs(t-o)<a&&(r=o,a=Math.abs(t-r))}}if(0!==(a=t-r))for(this._direction=a>0?"next":"prev",i=1;i<=Math.abs(a);i++)this._move()},ChiefSlider.prototype._autoplay=function(t){if(this._config.autoplay)return"stop"===t?(clearInterval(this._intervalId),void(this._intervalId=null)):void(null===this._intervalId&&(this._intervalId=setInterval(function(){this._direction="next",this._move()}.bind(this),this._config.interval)))},ChiefSlider.prototype._refresh=function(){var t=this._$itemList,i=t[0].offsetWidth,e=this._$wrapper.offsetWidth,s=Math.round(e/i);if(s!==this._itemsInVisibleArea){this._autoplay("stop"),this._$items.classList.add(SLIDER_TRANSITION_OFF),this._$items.style.transform="translateX(0)",this._widthItem=i,this._widthWrapper=e,this._itemsInVisibleArea=s,this._transform=0,this._transformStep=100/s,this._balancingItemsFlag=!1,this._activeItems=[];for(var r=0,a=t.length;r<a;r++){var n=t[r],o=r;n.dataset.index=o,n.dataset.order=o,n.dataset.translate=0,n.style.transform="translateX(0)",o<s&&this._activeItems.push(o)}if(this._setActiveClass(),this._updateIndicators(),window.requestAnimationFrame(function(){this._$items.classList.remove(SLIDER_TRANSITION_OFF)}.bind(this)),this._config.loop){var h=t.length-1,_=100*-t.length;t[h].dataset.order=-1,t[h].dataset.translate=100*-t.length,t[h].style.transform="translateX(".concat(_,"%)"),this.__refreshExtremeValues(),this._autoplay()}else this._$controlPrev&&this._$controlPrev.classList.add(CLASS_CONTROL_HIDE)}},ChiefSlider.prototype.next=function(){this._moveToNext()},ChiefSlider.prototype.prev=function(){this._moveToPrev()},ChiefSlider.prototype.moveTo=function(t){this._moveTo(t)},ChiefSlider.prototype.refresh=function(){this._refresh()};