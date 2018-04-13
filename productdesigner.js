/**
 * GoMage Product Designer Extension
 *
 * @category     Extension
 * @copyright    Copyright (c) 2013-2016 GoMage (https://www.gomage.com)
 * @author       GoMage
 * @license      https://www.gomage.com/license-agreement/  Single domain license
 * @terms of use https://www.gomage.com/terms-of-use/
 * @version      Release: 2.4.0
 * @since        Available since Release 1.0.0
 */

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        var aArgs = Array.prototype.slice.call(arguments, 1);
        var fToBind = this;
        var fNOP = function () {
        };
        var fBound = function () {
            return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}

/**
 * Convert first char in string to upper case
 */
var $ucfirst = function (str) {
    str += '';
    var f = str.charAt(0).toUpperCase();
    return f + str.substr(1);
};

function getUrlParams() {
    var paramString = window.location.search.substr(1);
    var paramArray = paramString.split("&");
    var params = {};

    for (var i = 0; i < paramArray.length; i++) {
        var tmpArray = paramArray[i].split("=");
        params[tmpArray[0]] = tmpArray[1];
    }
    return params;
}

var ProductDesignerGlobalEval = function ProductDesignerGlobalEval(src) {
    if (window.execScript) {
        window.execScript(src);
        return;
    }
    var fn = function () {
        window.eval.call(window, src);
    };
    fn();
};

/*By Raj*/
_convertMonoToSimpleText =  function (textObj){

    var font = (textObj.fontFamily);
    var text = (textObj.text);
    /* monogram helper functions */
    var characterMap= {
        '1': 'a',
        '2': 'b',
        '3': 'c',
        '4': 'd',
        '5': 'e',
        '6': 'f',
        '7': 'g',
        '8': 'h',
        '9': 'i',
        '0': 'j',
        '!': 'k',
        '@': 'l',
        '#': 'm',
        '$': 'n',
        '%': 'o',
        '^': 'p',
        '&': 'q',
        '*': 'r',
        '(': 's',
        ')': 't',
        '-': 'u',
        '=': 'v',
        '{': 'w',
        '}': 'x',
        '\\': 'y',
        ':': 'z'
    }

    var fontNameLower = font.toLowerCase();
    if(fontNameLower == 'circle-monograms-three-white-alt'){

        var newString = ""; 
        if(text.length===1){
            var isSpecialChar = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(text);
            var isnum = /^\d+$/.test(text);
            if(isnum || isSpecialChar){
                translatedChar = (characterMap[text]!=undefined) ? characterMap[text]: '';
            }else{
                translatedChar = text;
            }
            newString = translatedChar;
        }else{
            var lastChar = text[text.length -1];
            var translatedChar = (characterMap[lastChar]!=undefined) ? characterMap[lastChar]: '';
            newString = text.slice(0, (text.length -1))+ translatedChar;
        }
        return newString.toLowerCase();
    }else{
        return text;
    }


};

Event.observe(window, "resize", function() {
    var width = document.viewport.getWidth();
    var height = document.viewport.getHeight();
    var dims = document.viewport.getDimensions(); // dims.width and dims.height
    //console.log(dims);
    var prod = window.pd.config.product.images[window.pd.currentColor][window.pd.currentSlide]
    window.pd.resizeCanvas(prod)

});
/**
 * Create module namespace if not defined
 */
if (typeof GoMage == 'undefined') GoMage = {};

GoMage.ProductDesigner = function (config, continueUrl, loginUrl, registrationUrl, saveDesign) {
    'use strict';
    this.opt = {
        product_side_id: 'pd_sides',
        canvasScale: 1,
        scale_factor: 1.2
    };
    this.urls = {
        continue: continueUrl,
        login: loginUrl,
        registration: registrationUrl,
        saveDesign: saveDesign
    }
    this.history_storage = {};
    this.history = new History();
    this.layersManager = new LayersManager(this);
    this.config = config;
    this.prices = config.prices;
    this.container = config.container;
    this.navigation = config.navigation;
    this.currentProd = null;
    this.containerLayers = {};
    this.containerCanvases = {};
    this.productAdditionalImageTemplate = new Template($('product-image-template').innerHTML);
    this.productAdditionalImageTemplateLabel = new Template($('product-image-template-label').innerHTML); // mmc template with label
    this.isCustomerLogin = this.config.isCustomerLoggedIn;
    this.currentColor = null;
    this.currentSlide = null;
    this.designChanged = {};
    this.designId = {};
    this.loadProduct(config.product);
    this.observeChooseProduct();
    this.observeLayerControls();
    this.observeTabs();
    this.observeShareBtn();
    this.observeZoomBtn();
    this.observeSaveDesign();
    this.observeContinueBtn();
    this.observeProductImageChange();
    this.observeProductImageColorChange();
    this.initPrices();
    this.reloadPrice();
    this.observePriceMoreInfo();
    this.observeHelpIcons();
    this.observeHistoryChanges();

    this._toggleNavigationButtons('disabled');
    this._toggleControlsButtons();
    this._toggleHistoryButtons();

    //this.observeSubTabs(); // mmc 2ten monogram sub tabs

}

GoMage.ProductDesigner.prototype = {

    /* monogram helper functions */
    characterMap: {
        'a': '1',
        'b': '2',
        'c': '3',
        'd': '4',
        'e': '5',
        'f': '6',
        'g': '7',
        'h': '8',
        'i': '9',
        'j': '0',
        'k': '!',
        'l': '@',
        'm': '#',
        'n': '$',
        'o': '%',
        'p': '^',
        'q': '&',
        'r': '*',
        's': '(',
        't': ')',
        'u': '-',
        'v': '=',
        'w': '{',
        'x': '}',
        'y': '\\',
        'z': ':'
    },


    upperCaseMiddleLetterSpecial: function (vm, initials) {
        if (initials.length === 3) {
            return (
                initials[0].toLowerCase() +
                initials[1].toUpperCase() +
                initials[2].toLowerCase()
            );
        }else if(initials.length === 2) {
            return (
                initials[0].toLowerCase() +
                initials[1].toLowerCase()
            );
        }else if(initials.length === 1) {
            return (
                initials[0].toUpperCase()
            );
        }else{
            return '';  
        }
    },

    upperCaseMiddleLetter: function (vm, initials) {
        if (initials.length === 3) {
            return (
                initials[0].toLowerCase() +
                initials[1].toUpperCase() +
                initials[2].toLowerCase()
            );
        } else {
            return '';
        }
    },

    upperCaseLastLetter: function (vm, initials) {
        if (initials.length === 1) {
            return (
                initials[0].toUpperCase()
            );
        }else if (initials.length === 2) {
            return (
                initials[0].toLowerCase() +
                initials[1].toUpperCase()
            );
        } else {
            return '';
        }
    },

    upperCaseLetter: function (vm, initials, font) {
        if (initials.length >= font.minChars) {
            var result = '';
            for (var i = 0; i < font.maxChars && i < initials.length; i++) {
                result += initials[i].toUpperCase();
            }

            return result;
        } else {
            return '';
        }
    },

    specialThirdLetter: function (vm, initials) {
        if (initials.length === 3) {
            return (
                initials[0].toLowerCase() +
                initials[1].toUpperCase() +
                vm.characterMap[initials[2].toLowerCase()]
            );
        }else if (initials.length === 2) {
            return (
                initials[0].toLowerCase() +
                vm.characterMap[initials[1].toLowerCase()]
            );
        }else if (initials.length === 1) {
            return (
                vm.characterMap[initials[0].toLowerCase()]
            );
        } else {
            return '';
        }
    },

    updateText: function (font, initials) {
        if (initials.length > font.maxChars) {
            initials = initials.substring(0, font.maxChars);
            jQuery('#monogram_text').val(initials);
        }

        jQuery('#monogram_text').attr('maxlength', font.maxChars);
        if (font.maxChars === 1)
            jQuery('#monogram_text').next().text('Only 1 character allowed');
        else if (font.minChars === font.maxChars)
            jQuery('#monogram_text').next().text(font.minChars + ' characters required');
        else
            jQuery('#monogram_text').next().text('Only ' + font.minChars + '-' + font.maxChars + ' characters allowed');

        return initials;
    },

    transformMonogramText: function (font_code, initials) {
        var vm = this;
        var font = vm.fonts()[font_code];
        if (font) {
            initials = vm.updateText(font, initials);
            initials = font.translator(vm, initials, font);
            
            // certain fonts require prefix - don't think we will need this
            if (initials)
                return font.prefix + initials;
            else
                return initials;
        }
        else
            return initials;
    },

    getMonogramFont: function (font_code) {
        var vm = this;
        var font = vm.fonts()[font_code];
        if (font)
            return font.family;
        else
            return null;
    },

// mmc 2ten monogram this function translates the user keystroke into the correct 
// characters for the font
    fonts: function () {
        var vm = this;
        return {
            '1': {
                family: 'Monoscript',
                prefix: '',
                sizeReduction: 10,
                top: 7,
                translator: vm.upperCaseMiddleLetterSpecial,
                minChars: 1,
                maxChars: 3,
            },
            '30A': {
                family: 'Circle3',
                prefix: '',
                sizeReduction: 1,
                top: 5, // mmc 2ten top position on canvas
                translator: vm.specialThirdLetter,
                minChars: 1,
                maxChars: 3,
            },
            '32A': {
                family: 'Circle2',
                prefix: '',
                sizeReduction: 1,
                top: 5, // mmc 2ten top position on canvas
                translator: vm.upperCaseLastLetter,
                minChars: 1,
                maxChars: 2,
            },
            // mmc 2ten monogram - below are not in use 
            '30B': {
                family: 'circle-monograms-three-black',
                prefix: '/',
                sizeReduction: 2,
                top: 15,
                translator: vm.specialThirdLetter,
                minChars: 3,
                maxChars: 3
            },
            '30C': {
                family: 'circle-monograms-three-black',
                prefix: '<',
                sizeReduction: 4,
                top: 18,
                translator: vm.specialThirdLetter,
                minChars: 3,
                maxChars: 3
            },
            '30D': {
                family: 'circle-monograms-three-black',
                prefix: '>',
                sizeReduction: 2,
                top: 16,
                translator: vm.specialThirdLetter,
                minChars: 3,
                maxChars: 3
            },
            '31A': {
                family: 'circle-monograms-three-white-alt',
                prefix: '',
                sizeReduction: 0,
                top: 12,
                translator: vm.specialThirdLetter,
                minChars: 3,
                maxChars: 3
            },
            '31B': {
                family: 'circle-monograms-three-white-alt',
                prefix: '/',
                sizeReduction: 2,
                top: 15,
                translator: vm.specialThirdLetter,
                minChars: 3,
                maxChars: 3
            },
            '31C': {
                family: 'circle-monograms-three-white-alt',
                prefix: '<',
                sizeReduction: 4,
                top: 18,
                translator: vm.specialThirdLetter,
                minChars: 3,
                maxChars: 3
            },
            '31D': {
                family: 'circle-monograms-three-white-alt',
                prefix: '>',
                sizeReduction: 2,
                top: 16,
                translator: vm.specialThirdLetter,
                minChars: 3,
                maxChars: 3
            },
            '34': {
                family: 'david',
                prefix: '',
                sizeReduction: 1,
                top: 7,
                translator: vm.upperCaseLetter,
                minChars: 1,
                maxChars: 3
            },

        }
    },

    /* end monogram */

    fireEvent: function (element, event) {
        if (document.createEventObject) {
            // dispatch for IE
            var evt = document.createEventObject();
            return element.fireEvent('on' + event, evt)
        }
        else {
            // dispatch for firefox + others
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, true, true);
            return !element.dispatchEvent(evt);
        }
    },

    loadProduct: function (product, color) {

        if (!product) {
            return;
        }
        $('pd_current_product_name').innerHTML = product.name;
        if (!color) {
            color = product.default_color;
        }
        if (!product.images.hasOwnProperty(color)) {
            return;
        }

        this.currentColor = color;
        this.changeColorAttribute();

        var images = product.images[color];

        // todo make more flexible?
        // mmc this won't work on single site maybe?
        // mmc 2ten trying to get first image by getting the first active image thumbnail
        // var firstImage = jQuery('.pd_sides_list > li.active > .product-image').data('image-id');
        // var img = images[firstImage];
        // this.addDesignArea(img);
        // this.currentSlide = img.id;
        // return;

        // mmc 2ten this seems to rely on the order of the json to grab the first image
        // this does not always work since the json can change order when passed from the template to this script
        for (var prop in images) {
            if (images.hasOwnProperty(prop)) {
                var img = images[prop];
                this.addDesignArea(img);
                this.currentSlide = img.id;
                return;
            }
        }
    },

    changeColorAttribute: function () {

        if (isNaN(parseInt(this.currentColor))) {
            return;
        }

        var color_attribute = $('attribute' + this.config.colorAttributeId);
        if (color_attribute) {

            color_attribute.value = this.currentColor;
            this.fireEvent(color_attribute, 'change');

            color_attribute.up('dd').hide();
            color_attribute.up('dd').previous('dt').hide();

            var options = $$('#product-options-wrapper dd');
            var hide = true;

            options.each(function (option) {
                if (option.visible()) {
                    hide = false;
                    throw $break;
                }
            });

            if (hide) {
                $('product_options').hide();
            }

        }
    },

    observeChooseProduct: function () {
        if (this.navigation.chooseProduct) {
            this.navigation.chooseProduct.observe('click', function (e) {
                var elm = e.target || e.srcElement;
                var content = $(elm.id + '-content');
                if (content) {
                    if (content.getStyle('display') == 'none') {
                        content.setStyle({display: 'block'});
                    } else {
                        content.setStyle({display: 'none'});
                    }
                }
            });
        }
    },

    changeProductImage: function (id) {
        var img = this.config.product.images[this.currentColor][id];
        if (img && this.currentProd != img.id) {

            this.history_storage[this.currentSlide] = this.history;
            if (this.history_storage.hasOwnProperty(id)) {
                this.history = this.history_storage[id];
            } else {
                this.history = new History();
            }
            this.currentSlide = id;
            this.containerCanvases[this.currentProd] = this.canvas;
            if(typeof(this.container.childElements()) != "undefined")
                this.containerLayers[this.currentProd] = this.container.childElements()[0].remove();
            jQuery("#add_text_textarea").val(''); //@Fahad: empty the canvas area
            this.addDesignArea(img);
            this._toggleControlsButtons();
        }
    },

    changeProductColor: function (color) {
        this.containerCanvases[this.currentProd] = this.canvas;
        this.containerLayers[this.currentProd] = this.container.childElements()[0].remove();
        var product = this.config.product;
        this.loadProduct(product, color);
        this.updateProductImages(product);
        this.reloadPrice();
        this._toggleControlsButtons();
    },

    updateProductImages: function (product) {
        if (!$(this.opt.product_side_id)) {
            return;
        }
        var productsList = $(this.opt.product_side_id).down('ul');
        productsList.innerHTML = '';
        var images = product.images[this.currentColor];
        var imageTemplateData = {};
        var imagesHtml = '';
        var first = true;
        for (var id in images) {
            if (images.hasOwnProperty(id)) {
                imageTemplateData['class'] = first ? 'active' : '';
                imageTemplateData['ico'] = images[id].ico;
                imageTemplateData['image-id'] = id;
                imageTemplateData['data-image-id'] = images[id].id;
                imageTemplateData['data-url'] = images[id].u;
                if(images[id].label){
                    imageTemplateData['label'] = images[id].label; // mmc add label
                    imagesHtml += this.productAdditionalImageTemplateLabel.evaluate(imageTemplateData); // mmc evaluate label template
                }else{
                    // mmc evaluate normal template
                    imagesHtml += this.productAdditionalImageTemplate.evaluate(imageTemplateData);
                }
                first = false;
            }
        }

        productsList.innerHTML = imagesHtml;
    },

    observeTabs: function () {
        $('pd_panels_nav').childElements().invoke('observe', 'click', function (e) {
            var elm = e.target || e.srcElement;
            elm = elm.up('button.pd-btn') || elm;
            elm.siblings().invoke('removeClassName', 'active');
            elm.addClassName('active');
            var buttonId = elm.id;
            var tabContentElement = $(buttonId + '-content');
            if (tabContentElement) {
                if (buttonId == 'pd_add_text') {
                    var event = document.createEvent('Event');
                    event.initEvent('textTabShow', true, true);
                    document.dispatchEvent(event);
                }
                tabContentElement.siblings().invoke('setStyle', {display: 'none'});
                if (tabContentElement.getStyle('display') == 'none') {
                    tabContentElement.setStyle({display: 'block'});
                }
            }
        }.bind(this));
    },
    // mmc 2ten monogram added for text/monogram tab switching
    observeSubTabs: function () {
        $('subtab-nav').childElements().invoke('observe', 'click', function (e) {


            var elm = e.target || e.srcElement;
            elm = elm.up('button.subtab-nav__button') || elm;
            elm.siblings().invoke('removeClassName', 'active');
            elm.addClassName('active');
            var buttonId = elm.id;
            var tabContentElement = $(buttonId + '-content');

            // clear canvas
            for (var canvas in this.containerCanvases) {
                this.containerCanvases[canvas].clear();
            }

            // clear form fields
            jQuery('#monogram_text').val('');
            jQuery('#add_text_textarea').val('');

            if (tabContentElement) {
                // if (buttonId == 'pd_add_text') {
                //     var event = document.createEvent('Event');
                //     event.initEvent('textTabShow', true, true);
                //     document.dispatchEvent(event);
                // }
                tabContentElement.siblings().invoke('setStyle', {display: 'none'});

                // mmc not sure the event stuff here is needed
                if (buttonId == 'subtab_text') {
                    jQuery('#design_type').val("text");
                    
                    document.getElementById("add_text_textarea").maxLength = 10; // todo get from real settings reset maxlen 
                    // mmc 2ten if this is removed, works if don't interact with monogram form field
                    // mmc 2ten todo decide if this is necessary
                    var event = document.createEvent('Event');
                    event.initEvent('textTabShow', true, true);
                    document.dispatchEvent(event);
                    //GoMage.TextEditor.prototype.observeMonogramTab();
                } else if (buttonId == 'subtab_monogram') { // mmc 2ten todo changed
                    jQuery('#design_type').val("monogram");
                }

                if (tabContentElement.getStyle('display') == 'none') {
                    tabContentElement.setStyle({display: 'block'});
                }
            }

        }.bind(this));
    },
    //@Fahad: function to resize the current canvas based on the window size and canvas product size and current view
    resizeCanvas: function(prod){
        if (typeof prod === 'undefined') {
            return;
        }

            //@Fahad:
            var bgDim = this.getBGImageDim('#pd_container')
            //console.log("bgDim:",bgDim);
            var designAreaDim = {};
            designAreaDim.l = parseInt(prod.l);
            designAreaDim.t = parseInt(prod.t);
            designAreaDim.w = parseInt(prod.w);
            designAreaDim.h = parseInt(prod.h);

            if(parseInt(bgDim.width) != parseInt(prod.d[0]) )
            {
                var ratio = parseInt(bgDim.width) / parseInt(prod.d[0]);
                var top = (parseInt(prod.d[0]) - parseInt(bgDim.width))/2;
                designAreaDim.l = designAreaDim.l * ratio;
                designAreaDim.t = designAreaDim.t * ratio; // mmc 2ten remove " +top"
                designAreaDim.w = designAreaDim.w * ratio;
                designAreaDim.h = designAreaDim.h * ratio;
            }
            var designArea = document.getElementsByClassName("pd-design-area")[0];
            designArea.style.marginLeft = designAreaDim.l + 'px';
            designArea.style.marginTop = designAreaDim.t + 'px';
            designArea.style.width = designAreaDim.w + 'px';//@Fahad:
            designArea.style.height = designAreaDim.h + 'px';//@Fahad:
            designArea.style.zIndex = '1000';

            window.pd.canvas.setWidth(designAreaDim.w);
            window.pd.canvas.setHeight(designAreaDim.h);

            // mmc 2ten position tools over image
            this.positionTools();

        // mmc remove - see note about setting this in the css
        // this.container.style.height = parseInt(prod.d[1]) + 'px';
        // this.container.style.width = parseInt(prod.d[0]) + 'px';

        window.pd.canvas.getObjects().each(function (object) {
            if (object.type == 'text') {
                object.center();
                object.setCoords();
            }
        });
        window.pd.canvas.renderAll();
    },

    positionTools: function(top){   

        var designArea = document.getElementsByClassName("pd-design-area")[0];
        var top = designArea.style.marginTop;    

        // mmc 2ten adjust top position of .pd-custom-wrapper
        var top = parseInt(top, 10);
        var tools = document.getElementsByClassName("pd-custom-wrapper")[0];
        var toolsTop = top - tools.getHeight() - 20;
        tools.style.top = toolsTop + 'px';

        // mmc adds padding to compensate for panel going outside the area - not needed for now
        // var wrap = document.getElementsByClassName("pd-container__wrap")[0];
        // if(toolsTop < 0){
        //     // add padding to pd-container__wrap to  
        //     var wrapPad = Math.abs(toolsTop) + 20; 
        //     wrap.style.paddingTop = wrapPad + 'px';     
        // }else{
        //     wrap.style.paddingTop = 0;
        // }
    },

    addDesignArea: function (prod) {

        if (typeof prod === 'undefined') {
            return;
        }

        //Deselect method call 
        this.deselectAllOnTabSwitch(prod);

        // mmc 2ten remove this setting to 100% height and width in css
        // going to use another container to fix the width/height
        // this.container.style.height = parseInt(prod.d[1]) + 'px';
        // this.container.style.width = parseInt(prod.d[0]) + 'px';

        this.container.style.position = 'absolute'; //@Fahad:
        this.container.style.background = 'url(' + prod.u + ') no-repeat center top'; // mmc 2ten position bg top
        if (typeof this.containerLayers[prod.id] === 'undefined') {
            //@Fahad:
            var bgDim = this.getBGImageDim('#pd_container')
            //console.log("bgDim:",bgDim);
            var designAreaDim = {};
            designAreaDim.l = parseInt(prod.l);
            designAreaDim.t = parseInt(prod.t);
            designAreaDim.w = parseInt(prod.w);
            designAreaDim.h = parseInt(prod.h);

            if(parseInt(bgDim.width) != parseInt(prod.d[0]) )
            {
                var ratio = parseInt(bgDim.width) / parseInt(prod.d[0]);
                var top = (parseInt(prod.d[0]) - parseInt(bgDim.width))/2;
                designAreaDim.l = designAreaDim.l * ratio;
                designAreaDim.t = designAreaDim.t * ratio; //mmc 2ten remove "+top";
                designAreaDim.w = designAreaDim.w * ratio;
                designAreaDim.h = designAreaDim.h * ratio;

            }
            var designArea = document.createElement('div');
            designArea.setAttribute('class', 'pd-design-area');
            designArea.setAttribute('id', 'designArea-' + prod.id);
            designArea.style.position = 'relative'; //@Fahad:
            designArea.style.marginLeft = designAreaDim.l + 'px';
            designArea.style.marginTop = designAreaDim.t + 'px';
            designArea.style.width = designAreaDim.w + 'px';//@Fahad:
            designArea.style.height = designAreaDim.h + 'px';//@Fahad:
            designArea.style.zIndex = '1000';

            var canvas = document.createElement('canvas');
            canvas.setAttribute('class', 'pd-canvas-pane');
            canvas.setAttribute('width', designAreaDim.w);
            canvas.setAttribute('height', designAreaDim.h);

            designArea.appendChild(canvas);

            this.container.appendChild(designArea);
            this.designArea = designArea;
            this.canvas = new fabric.Canvas(canvas);
            this.canvas.selection = false;
            this.containerCanvases[prod.id] = this.canvas;
            this._observeCanvasObjects();
        } else {
            var designArea = this.containerLayers[prod.id];

            // mmc 2ten note
            // need to resize design area and canvas here

            this.container.appendChild(designArea);
            this.designArea = designArea;
            this.canvas = this.containerCanvases[prod.id];
            var currentCanvas = this.canvas;
            this.canvas.selection = false;
            this.canvas.getObjects().each(function (object) {
                if (object.type == 'text') {
                    currentCanvas.setActiveObject(object);
                    var objSimpleText = _convertMonoToSimpleText(object);
                    jQuery("#add_text_textarea").val(objSimpleText);
                    // mmc 2ten raj this is the original 
                    // jQuery("#add_text_textarea").val(object.text);
                }
            });
        }

        // mmc 2ten position tools over image
        this.positionTools();
        this.currentProd = prod.id;
    },

    observeSaveDesign: function () {
        if (this.navigation.saveDesign) {
            this.navigation.saveDesign.observe('click', function (e) {
                e.stop();
                if (!this.canvasesHasLayers()) {
                    alert('Please add at least one customization');
                    return;
                }
                if (this.navigation.saveDesign.hasClassName('disabled') || !this.designChanged.hasOwnProperty(this.currentColor)
                    || (this.designChanged.hasOwnProperty(this.currentColor) && this.designChanged[this.currentColor] == false )) {
                    return;
                }
                if (!this.isCustomerLogin) {
                    this.createCustomerLoginWindows();
                    if (this.loginWindow) {
                        this.loginWindow.showCenter(true);
                        setTimeout(function () {
                            this.loginWindow.setSize(this.loginWindow.width, $('customer-login-container').getHeight(), true);
                        }.bind(this), 320);
                    }
                } else if (this.isCustomerLogin) {
                    this.saveDesign(this.urls.saveDesign, this.saveDesignCallback);
                }
            }.bind(this));
        }
    },

    createCustomerLoginWindows: function () {
        if (!this.isCustomerLogin) {
            if (!this.loginWindow && $('customer-login-container')) {
                this.loginWindow = this.createPopupWindow('customer-login-container', 'login-error-msg', {
                    className: 'magento',
                    title: 'Login',
                    width: 430,
                    minWidth: 430,
                    maximizable: false,
                    minimizable: false,
                    resizable: false,
                    draggable: false,
                    recenterAuto: false,
                    showEffect: Effect.BlindDown,
                    hideEffect: Effect.BlindUp,
                    showEffectOptions: {duration: 0.3},
                    hideEffectOptions: {duration: 0.3}
                });

                this.observeRegisterBtn();
                this.observeLogin();
            }
            if (!this.registrationWindow && $('customer-register-container')) {
                this.registrationWindow = this.createPopupWindow('customer-register-container', 'register-error-msg', {
                    className: 'magento',
                    title: 'Registration',
                    width: 900,
                    minWidth: 900,
                    minHeight: 410,
                    maximizable: false,
                    minimizable: false,
                    resizable: false,
                    draggable: false,
                    showEffect: Effect.BlindDown,
                    hideEffect: Effect.BlindUp,
                    showEffectOptions: {duration: 0.3},
                    hideEffectOptions: {duration: 0.3}
                });
                this.observeRegisterSubmitBtn();
            }
            Event.on(document.body, 'click', '#overlay_modal', function (e, elm) {
                e.stop();
                Windows.closeAll();
            });
        }
    },

    createPopupWindow: function (contentId, errorContainerId, params) {
        var win = new Window(params);
        win.errorContainerId = errorContainerId
        win.setContent(contentId, true, true);
        win.setZIndex(2000);
        return win;
    },

    observeRegisterBtn: function () {
        var registerBtn = $('customer-register-btn');
        if (registerBtn) {
            registerBtn.observe('click', function (e) {
                e.stop();
                this.loginWindow.close();
                setTimeout(function () {
                    this.registrationWindow.showCenter(true);
                }.bind(this), 1000);
            }.bind(this));
        }
    },

    observeRegisterSubmitBtn: function () {
        var registerBtn = $('customer-register-submit-btn');
        if (registerBtn) {
            registerBtn.observe('click', function (e) {
                e.stop();
                this.loginAndSaveDesign(this.urls.registration, 'form-validate', this.registrationWindow);
            }.bind(this));
        }
    },

    observeLogin: function () {
        var loginBtn = $('customer-login-btn');
        if (loginBtn) {
            loginBtn.observe('click', function (e) {
                e.stop();
                this.loginAndSaveDesign(this.urls.login, 'login-form', this.loginWindow);
            }.bind(this));
        }
    },

    loginAndSaveDesign: function (url, formId, popupWindow) {
        var form = new VarienForm(formId, true);
        if (form.validator.validate()) {
            var elements = form.form.elements;
            var data = {};
            for (var index in elements) {
                if (elements.hasOwnProperty(index)) {
                    var elm = elements[index];
                    if (typeof elm == "object" && elm.tagName == 'INPUT') {
                        if (elm.type == 'checkbox') {
                            data[elm.name] = elm.checked
                        } else {
                            data[elm.name] = elm.value;
                        }
                    }
                }
            }
            ;
            var imagesData = this.prepareImagesForSave();
            var data = Object.extend(data, imagesData);
            new Ajax.DesignerRequest(url, {
                method: 'post',
                parameters: data,
                onSuccess: function (transport) {
                    var response = transport.responseText.evalJSON();
                    if (response.status == 'success') {
                        this.isCustomerLogin = true;
                        this.clearLoginErrors(popupWindow.errorContainerId);
                        if (response.top_links) {
                            if ($$('.page-header-container').length) {
                                var quickAccessContainer = $$('.page-header-container');
                            } else {
                                var quickAccessContainer = $$('.quick-access');
                            }
                            var linksHtml = response.top_links;
                        } else if (response.account_links) {
                            var quickAccessContainer = $$('.header-panel');
                            var linksHtml = response.account_links;
                        }

                        if (quickAccessContainer && quickAccessContainer != undefined) {
                            var quickAccessContainer = quickAccessContainer[0];
                            if (response.welcome_text) {
                                var welcomeText = quickAccessContainer.down('.welcome-msg');
                                if (welcomeText) {
                                    welcomeText.update(response.welcome_text);
                                }
                            }
                            if (linksHtml) {
                                var topLinks = quickAccessContainer.down('.links');
                                if (topLinks) {
                                    topLinks.replace(linksHtml);
                                }
                            }
                        }
                        popupWindow.close();

                        this.designChanged[this.currentColor] = false;
                        this.designId[this.currentColor] = response.design_id;
                        window.onbeforeunload = null;
                        this._toggleNavigationButtons('disabled');
                        this._toggleControlsButtons();
                        alert('Design was saved');
                    } else if (response.status == 'redirect' && response.url) {
                        location.href = response.url;
                    } else if (response.status == 'error' && response.message) {
                        if (typeof response.message == 'object') {
                            response.message.each(function (message) {
                                this.addLoginError(popupWindow.errorContainerId, message);
                            }.bind(this));
                        } else {
                            this.addLoginError(popupWindow.errorContainerId, response.message);
                        }

                    }
                }.bind(this)
            });
        }
    },

    addLoginError: function (containerId, message) {
        var errorContainer = $(containerId);
        var item = document.createElement('span');
        item.innerHTML = message;
        var itemWrapper = document.createElement('li');
        itemWrapper.appendChild(item);
        errorContainer.down().appendChild(itemWrapper);
        errorContainer.up().show();
    },

    clearLoginErrors: function (containerId) {
        var errorContainer = $(containerId).down();
        errorContainer.innserHTML = '';
        errorContainer.up().hide();
    },

    prepareImagesForSave: function () {
        var data = {};

        if ((this.canvas == null) || this.canvas == 'undefined') {
            return data;
        }
        var colorImages = this.config.product.images[this.currentColor];
        var images = {};
        for (var imageId in this.containerCanvases) {
            if (this.containerCanvases.hasOwnProperty(imageId) && colorImages.hasOwnProperty(imageId)) {
                var canvas = this.containerCanvases[imageId];
                if (canvas.getObjects().length > 0) {
                    canvas.deactivateAll();
                    canvas.renderAll();
                    var image = canvas.toSVG();
                    images[imageId] = image;
                    var contextTop = canvas.contextTop;
                    if (contextTop && contextTop != undefined) {
                        canvas.clearContext(contextTop);
                    }
                }
            }
        }
        console.log(images);
        if (Object.keys(images).length > 0) {
            var params = getUrlParams();
            data['id'] = params['id'];
            data['images'] = Object.toJSON(images);
            data['prices'] = Object.toJSON(this.designPrices);
            data['attributes'] = Object.toJSON(this.getImageAttributes());
            if (this.currentColor) {
                data['color'] = this.currentColor;
            }
            var commentField = $('design_comment');
            if (commentField && commentField.value) {
                data['comment'] = commentField.value;
            }
        }

        return data;
    },

    getImageAttributes: function() {
        var layers = window.pd.layersManager.layers;
        var attributes = {};
        for (layer in layers) {
            var layerObj = layers[layer]
            attributes[layerObj.image_id] = {
                'design_type'   : document.getElementById('design_type').value,
                'font_code'     : layerObj.fontFamily,
                'font_size'     : layerObj.fontSize,
                'design_text'   : layerObj.text,
            };
        }
        return attributes;
    },

    canvasesHasLayers: function () {
        var count = 0;
        var colorImages = this.config.product.images[this.currentColor];
        for (var imageId in this.containerCanvases) {
            if (colorImages.hasOwnProperty(imageId)) {
                var canvasCount = this.canvasHasLayers(imageId);
                if (canvasCount) {
                    count += canvasCount;
                }
            }
        }
        return (count > 0);
    },

    canvasHasLayers: function (id) {
        var canvas = this.containerCanvases[id];
        if (canvas && canvas != 'undefined') {
            return canvas.getObjects().length;
        }

        return false;
    },

    saveDesign: function (url, responseCallback, data) {
        if ((this.canvas == null) || this.canvas == 'undefined') {
            return;
        }

        var params = this.prepareImagesForSave();

        if (typeof data != 'undefined') {
            params = $H(params).merge(data);
        }

        new Ajax.DesignerRequest(url, {
            method: 'post',
            parameters: params,
            onSuccess: responseCallback.bind(this)
        });
    },

    continueCallback: function (transport) {
        var response = transport.responseText.evalJSON();
        if (response.status == 'redirect' && response.url != undefined) {
            window.onbeforeunload = null;
            $('design_option').value = response.design_id;
            productAddToCartForm.submit();
        } else if (response.status == 'error') {
            console.log(response.message);
        }
    },

    saveDesignCallback: function (transport) {
        var response = transport.responseText.evalJSON();
        if (response.status == 'success') {
            alert('Design was saved');
            this.designChanged[this.currentColor] = false;
            this.designId[this.currentColor] = response.design_id;
            this._toggleNavigationButtons('disabled');
            this._toggleControlsButtons();
            window.onbeforeunload = null;
        } else if (response.status == 'error') {
            console.log(response.message);
        }
    },

    observeContinueBtn: function () {
        if (this.navigation.continue) {
            this.navigation.continue.observe('click', function (e) {
                e.stop();
                if (!this.canvasesHasLayers()) {
                    alert('Please add to canvas though one layer');
                    return;
                }
                if (this.navigation.continue.hasClassName('disabled')) {
                    return;
                }
                if (!productAddToCartForm.validator.validate()) {
                    alert('Please choose product options');
                    return;
                }
                if ((this.designChanged.hasOwnProperty(this.currentColor) && this.designChanged[this.currentColor] === false)
                    && (this.designId.hasOwnProperty(this.currentColor) && this.designId[this.currentColor] !== null)) {
                    window.onbeforeunload = null;
                    location.href = this.config.product.url + '?design_id=' + this.designId[this.currentColor];
                }
                this.saveDesign(this.urls.continue, this.continueCallback);
            }.bind(this));
        }
    },

    removeObject: function (obj) {
        var event = document.createEvent('Event');
        event.obj = obj;
        event.initEvent('removeObject', true, true);
        document.dispatchEvent(event);
        this.layersManager.removeById(obj.get('uid'));
    },

    observeLayerControls: function () {
        document.observe('keydown', function (e) {
            if (e.ctrlKey == true && e.which == 90) {
                this.history.undo();
            }

            if (e.ctrlKey == true && e.which == 89) {
                this.history.redo();
            }

            if ((e.ctrlKey == true && e.which == 8) || (e.which == 46)) {
                if ((this.canvas == null) || this.canvas == 'undefined') {
                    return;
                }
                var obj = this.canvas.getActiveObject();
                if (obj) {
                    this.removeObject(obj);
                }
            }
        }.bind(this));

        $(this.config.controls.remove).observe('click', function (e) {
            e.stop();
            var obj = this.canvas.getActiveObject();
            if (obj) {
                this.removeObject(obj);
            }
        }.bind(this));

        $(this.config.controls.undo).observe('click', function (e) {
            e.stop();
            this.history.undo();
        }.bind(this));

        $(this.config.controls.redo).observe('click', function (e) {
            e.stop();
            this.history.redo();
        }.bind(this));

        $(this.config.controls.flip_x).observe('click', function (e) {
            e.stop();
            this.flipXLayer();
        }.bind(this));

        $(this.config.controls.flip_y).observe('click', function (e) {
            e.stop();
            this.flipYLayer();
        }.bind(this));

        $(this.config.controls.allign_by_center).observe('click', function (e) {
            e.stop();
            this.alignByCenterLayer();
        }.bind(this));

        $(this.config.controls.front).observe('click', function (e) {
            e.stop();
            this.changePosition('front');
        }.bind(this));

        $(this.config.controls.back).observe('click', function (e) {
            e.stop();
            this.changePosition('back');
        }.bind(this));

    },

    observeCanvasObjectModified: function () {
        if ((this.canvas == null) || this.canvas == 'undefined') {
            return;
        }
        // Canvas events
        this.canvas.observe('object:modified', function (e) {
            var orig = e.target.originalState;
            // CASE 1: object has been moved

            var cmds = [];

            if (Math.round(orig.left) != Math.round(e.target.left) || Math.round(orig.top) != Math.round(e.target.top)) {
                if ((e.target.left + e.target.width / 2 <= 0) || (e.target.left - e.target.width / 2 >= this.canvas.getWidth())) {
                    return;
                } else if ((e.target.top + e.target.height / 2 <= 0) || (e.target.top - e.target.height / 2 >= this.canvas.getHeight())) {
                    return;
                }
                var cmd = new MovingCommand(
                    this.canvas,
                    this.canvas.getActiveObject(),
                    {left: orig.left, top: orig.top},
                    {left: e.target.left, top: e.target.top}
                );
                cmds.push(cmd);
            }

            // CASE 2: object has been rotated
            if (orig.angle != e.target.angle) {
                var obj = this.canvas.getActiveObject();
                var cmd = new RotateCommand(this.canvas, obj, {angle: orig.angle}, {angle: e.target.angle});
                cmds.push(cmd);
            }

            // CASE 3: object has been resized
            if (orig.scaleX != e.target.scaleX || orig.scaleY != e.target.scaleY) {
                var cmd = new ResizeCommand(
                    this.canvas,
                    this.canvas.getActiveObject(),
                    {scaleX: orig.scaleX, scaleY: orig.scaleY},
                    {scaleX: e.target.scaleX, scaleY: e.target.scaleY}
                );
                cmds.push(cmd);
            }

            if (cmds.length == 1) {
                this.history.push(cmds[0]);
            } else if (cmds.length > 1) {
                var cmd = new GroupCommand(cmds);
                this.history.push(cmd);
            }

        }.bind(this));
    },

    observeCanvasObjectMoving: function () {
        if ((this.canvas == null) || this.canvas == 'undefined') {
            return;
        }

        this.canvas.observe('object:moving', function (e) {
            var obj = this.canvas.getActiveObject();
            if (!obj) {
                return;
            }
            setTimeout(function () {
                if ((obj.left + obj.width / 2 <= 0) || (obj.left - obj.width / 2 >= this.canvas.getWidth())) {
                    this.layersManager.removeById(obj.get('uid'));
                }

                if ((obj.top + obj.height / 2 <= 0) || (obj.top - obj.height / 2 >= this.canvas.getHeight())) {
                    this.layersManager.removeById(obj.get('uid'));
                }
            }.bind(this), 1000);
        }.bind(this));
    },

    observeCanvasObjectSelected: function () {
        if ((this.canvas == null) || this.canvas == 'undefined') {
            return;
        }
        this.canvas.observe('object:selected', function (e) {
            this.layersManager.fireSelectEvent(this.canvas.getActiveObject());
        }.bind(this));
    },

    observeCanvasObjectRendered: function () {
        if ((this.canvas == null) || this.canvas == 'undefined') {
            return;
        }
        this.canvas.observe('after:render', function (e) {
            var n = 0;
            this.canvas.forEachObject(function (o) {
                var l = o.left;
                var t = o.top;
                var w = Math.round(o.getWidth() );
                var h = Math.round(o.getHeight() );
                var f = false;
                //@Fahad: changes for red box
                if (l < 0) f = true;
                if (t < 0) f = true;
                if ((l+w) > this.canvas.getWidth() ) f = true;
                if ((t+h) > this.canvas.getHeight()) f = true;
                if (f) {
                    n++;
                    this.layersManager.markAsOutside(o.get('uid'));
                } else {
                    this.layersManager.removeOutsideMark(o.get('uid'));
                }
            }.bind(this));

            var warningMsg = document.getElementById("outside-warning-msg"); // mmc 2ten 
            if (n > 0) {
                this.designArea.addClassName('outside-warning');

                // mmc 2ten warning message
                if(warningMsg === null){

                    var outsideWarning = document.createElement("div");
                    outsideWarning.innerHTML = "Outside Boundary";
                    outsideWarning.id = "outside-warning-msg";
                    this.designArea.appendChild(outsideWarning);
                    // mmc 2ten don't disable button
                    // document.getElementById("pd_gt_product").disabled = true;
                }

            } else {
                this.designArea.removeClassName('outside-warning');
                
                // mmc 2ten remove warning message
                if(warningMsg != null){
                    warningMsg.remove();
                    // mmc 2ten not disabling button anymore
                    // document.getElementById("pd_gt_product").disabled = false;
                }
            }

            if (!this.canvas.getActiveObject()) {
                this.layersManager.fireBlurEvent();
            }
        }.bind(this));
    },

    observeCanvasSelection: function () {
        if ((this.canvas == null) || this.canvas == 'undefined') {
            return;
        }
        this.canvas.observe('selection:cleared', function (e) {
            this._toggleControlsButtons();
        }.bind(this));
    },

    observeProductImageChange: function () {
        Event.on($(this.opt.product_side_id), 'click', '.product-image', function (e, elem) {
            elem.up('li').addClassName('active');
            elem.up('li').siblings().invoke('removeClassName', 'active');
            this.changeProductImage(elem.readAttribute('data-id'));
        }.bind(this));
    },

    observeProductImageColorChange: function () {
        Event.on($('product-colors'), 'click', '.color-btn', function (e, elem) {
            e.stop();
            var color = elem.getAttribute('data-color_id');
            if (this.currentColor != color) {
                if (!elem.hasClassName('selected')) {
                    elem.siblings().invoke('removeClassName', 'selected');
                }
                elem.addClassName('selected');
                this.changeProductColor(color);
                this._toggleNavigationButtons('disabled');
            }
        }.bind(this));
    },

    disableMonogramFonts(state){
        var isAttrAdded = false;
        jQuery("#font-selector").children().each(function(i,el){
          var selVal = jQuery(el).val().toLowerCase();
          if(selVal=="circle-monograms-three-white-alt" || selVal=="circle-monograms-two-white" || selVal=="monogram-kk-sc"){
            //console.log("hee"+ isAttrAdded);
            if(jQuery(el).attr("disabled")!=undefined)
                isAttrAdded = true;

            jQuery(el).attr("disabled",state);
          }
        });

        //Is neccessory to add check for the first time becuase there is no disabled check
        if(isAttrAdded)
            jQuery("#font-selector").selectBoxIt().data("selectBox-selectBoxIt").refresh();
    },

    deselectAllOnTabSwitch(productInfo){
        if(productInfo && Object.keys(productInfo).length>0){
            if(productInfo.monogram==="true"){
                this.disableMonogramFonts(false);    
            }else{
                this.disableMonogramFonts(true);
            }
            jQuery("#font-selector").selectBoxIt().data("selectBox-selectBoxIt").destroy();
            jQuery("#font-selector").val("Lato");
            jQuery("#font-selector").selectBoxIt().data("selectBox-selectBoxIt").refresh();
            jQuery("#add_text_textarea").removeAttr("maxlength");  
        }
        //this.canvas.deactivateAll().renderAll();    
    },

    flipXLayer: function () {
        if ((this.canvas == null) || this.canvas == 'undefined') {
            return;
        }
        var activeObject = this.canvas.getActiveObject();
        if (!activeObject) {
            return;
        }
        var flip = false;
        var originalFlipX = activeObject.flipX;
        var originalFlipY = activeObject.flipY;
        if (activeObject.flipX == false) {
            flip = true;
        } else {
            flip = false;
        }

        var cmd = new FlipCommand(
            this.canvas,
            activeObject,
            {flipX: originalFlipX, flipY: originalFlipY},
            {flipX: flip, flipY: originalFlipY}
        );

        cmd.exec();
        this.history.push(cmd);
    },

    flipYLayer: function () {
        if ((this.canvas == null) || this.canvas == 'undefined') {
            return;
        }
        var activeObject = this.canvas.getActiveObject();
        if (!activeObject) {
            return;
        }
        var flip = false;
        var originalFlipY = activeObject.flipY;
        var originalFlipX = activeObject.flipX;
        if (activeObject.flipY == false) {
            flip = true;
        } else {
            flip = false;
        }

        var cmd = new FlipCommand(
            this.canvas,
            activeObject,
            {flipY: originalFlipY, flipX: originalFlipX},
            {flipY: flip, flipX: originalFlipX}
        );

        cmd.exec();
        this.history.push(cmd);
    },

    alignByCenterLayer: function () {
        if ((this.canvas == null) || this.canvas == 'undefined') {
            return;
        }
        var activeObject = this.canvas.getActiveObject();
        if (!activeObject) {
            return;
        }
        var cmd = new AlignToCenterCommand(this.canvas, activeObject);
        cmd.exec();
        this.history.push(cmd);
    },

    changePosition: function (position) {
        if ((this.canvas == null) || this.canvas == 'undefined') {
            return;
        }
        var activeObject = this.canvas.getActiveObject();
        if (!activeObject) {
            return;
        }
        var cmd = new ChangePositionCommand(this.canvas, activeObject, position);
        cmd.exec();
        this.history.push(cmd);
    },

    observeShareBtn: function () {
        if (!this.config.navigation.share) {
            return;
        }
        this.config.navigation.share.observe('click', function (e) {
            e.stop();
            this.saveDesign(this.urls.saveDesign, this.shareDesignCallback, {share: true});
        }.bind(this));
    },

    shareDesignCallback: function (transport) {
        var response = transport.responseText.evalJSON();
        if (response.status == 'success') {
            if (response.share) {
                this.innerHTMLwithScripts($('share-container'), response.share);
            }
            this.designChanged[this.currentColor] = false;
            this.designId[this.currentColor] = response.design_id;
            this._toggleNavigationButtons('disabled');
            this._toggleControlsButtons();
            window.onbeforeunload = null;
            this.createShareWindow();
            this.shareWindow.showCenter(true);
        } else if (response.status == 'error') {
            console.log(response.message);
        }
    },

    innerHTMLwithScripts: function (element, content) {
        var js_scripts = content.extractScripts();
        element.innerHTML = content.stripScripts();
        for (var i = 0; i < js_scripts.length; i++) {
            if (typeof(js_scripts[i]) != 'undefined') {
                ProductDesignerGlobalEval(js_scripts[i]);
            }
        }
    },

    createShareWindow: function () {
        if (!this.shareWindow) {
            this.shareWindow = new Window({
                className: 'magento',
                title: 'Share',
                minWidth: 300,
                minHeight: 300,
                maximizable: false,
                minimizable: false,
                resizable: false,
                draggable: false,
                recenterAuto: false,
                showEffect: Effect.BlindDown,
                hideEffect: Effect.BlindUp,
                showEffectOptions: {duration: 0.4},
                hideEffectOptions: {duration: 0.4}
            });
            this.shareWindow.setContent('share-container', true, true);
            this.shareWindow.setZIndex(2000);
            Event.on(document.body, 'click', '#overlay_modal', function (e, elm) {
                Windows.closeAll();
            });
        }
    },

    observeZoomBtn: function () {
        if (!this.config.navigation.zoom) {
            return;
        }
        this.config.navigation.zoom.observe('click', function (e) {
            e.stop();
            this.zoom();
        }.bind(this));
    },

    zoom: function () {
        this.createZoomWindow();
        this.zoomWindow.showCenter(true);
        this._toggleControlsButtons();
    },

    createZoomCanvas: function () {
        if (this.config.product.images[this.currentColor][this.currentProd].orig_image == undefined) {
            return;
        }
        var origImage = this.config.product.images[this.currentColor][this.currentProd].orig_image;
        var imgUrl = origImage.url;
        var canvas = $('product-zoom-canvas');
        canvas.innerHTML = '';
        $('product-zoom-container').innerHTML = '';
        canvas.setAttribute('width', parseInt(this.config.imageMinSize.width));
        canvas.setAttribute('height', parseInt(this.config.imageMinSize.height));
        $('product-zoom-container').appendChild(canvas);
        var zoomCanvas = new fabric.Canvas(canvas);

        zoomCanvas.selection = false;
        fabric.Image.fromURL(imgUrl, function (obj) {

            var backgroundImage = this.prepareBackgroundZoomImage(obj);

            var group_left = (parseInt(this.config.imageMinSize.width) - backgroundImage.get('width')) / 2;
            var group_top = (parseInt(this.config.imageMinSize.height) - backgroundImage.get('height')) / 2;

            if (this.containerCanvases[this.currentProd].getObjects().length > 0) {

                var canvas = this.containerCanvases[this.currentProd];
                canvas.deactivateAll();
                canvas.renderAll();
                var image = canvas.toDataURL();
                var contextTop = canvas.contextTop;
                if (contextTop && contextTop != undefined) {
                    canvas.clearContext(contextTop);
                }
                fabric.Image.fromURL(image, function (obj) {
                    var designImage = this.prepareDesignImageForZoom(obj);

                    var group = new fabric.Group([backgroundImage, designImage], {
                        left: group_left,
                        top: group_top,
                        hasControls: false,
                        hasBorders: false
                    });
                    zoomCanvas.add(group);
                    zoomCanvas.setActiveObject(group);
                    zoomCanvas.renderAll();
                }.bind(this))

            } else {
                var group = new fabric.Group([backgroundImage], {
                    left: group_left,
                    top: group_top,
                    hasControls: false,
                    hasBorders: false
                });
                zoomCanvas.add(group);
                zoomCanvas.setActiveObject(group);
                zoomCanvas.renderAll();
            }
        }.bind(this));
    },

    prepareBackgroundZoomImage: function (obj) {
        var origImage = this.config.product.images[this.currentColor][this.currentProd].orig_image;
        obj.set({
            height: Math.round(parseInt(origImage.dimensions[1])),
            width: Math.round(parseInt(origImage.dimensions[0])),
            left: 0,
            top: 0,
            hasControls: false,
            hasBorders: true
        });

        return obj;
    },

    prepareDesignImageForZoom: function (obj) {
        var currentImg = this.config.product.images[this.currentColor][this.currentProd];
        var origImage = this.config.product.images[this.currentColor][this.currentProd].orig_image;

        var scale_x = origImage.dimensions[0] / currentImg.d[0];
        var scale_y = origImage.dimensions[1] / currentImg.d[1];

        obj.set({
            width: Math.round(currentImg.w * scale_x),
            height: Math.round(currentImg.h * scale_y),
            top: Math.round(currentImg.t * scale_y),
            left: Math.round(currentImg.l * scale_x),
            hasControls: false,
            hasBorders: false
        });

        return obj;
    },

    createZoomWindow: function () {
        if (!this.zoomWindow) {
            this.zoomWindow = new Window({
                className: 'magento',
                title: 'Zoom In',
                width: parseInt(this.config.imageMinSize.width),
                minWidth: parseInt(this.config.imageMinSize.width),
                height: parseInt(this.config.imageMinSize.height),
                minHeight: parseInt(this.config.imageMinSize.height),
                maximizable: false,
                minimizable: false,
                resizable: false,
                draggable: false,
                recenterAuto: false,
                showEffect: Effect.BlindDown,
                hideEffect: Effect.BlindUp,
                showEffectOptions: {duration: 0.4},
                hideEffectOptions: {duration: 0.4},
                onShow: this.createZoomCanvas.bind(this)
            });
            this.zoomWindow.setContent('product-zoom-container', true, true);
            this.zoomWindow.setZIndex(2000);
            Event.on(document.body, 'click', '#overlay_modal', function (e, elm) {
                Windows.closeAll();
            });
        }
    },

    initPrices: function () {
        this.pricesContainers = {};
        this.pricesContainers[0] = $('fixed_price');
        this.pricesContainers[1] = $('design_areas_price');
        this.pricesContainers[2] = $('images_price');
        this.pricesContainers[3] = $('texts_price');
    },
    //@Fahad: Function to check the difference of dimensions for the product bg image
    getBGImageDim: function(id){

    var imageSrc = jQuery(id).css('backgroundImage')
            .replace(/url\((['"])?(.*?)\1\)/gi, '$2')
            .split(',')[0];
        var image = new Image();
        image.src = imageSrc;
        var bgwidth = image.width,
            bgheight = image.height,
            bgContainWidth = jQuery(id).width();

        var bgContainHeight = (bgheight*bgContainWidth)/bgwidth;

        var decimal = bgContainHeight.toString().split('.');

        if(decimal[0]>=5)
        {
            bgContainHeight = Math.ceil(bgContainHeight);
        }
        else
        {
            bgContainHeight = Math.floor(bgContainHeight);
        }

        return {'width':bgContainWidth,'height':bgContainHeight}

    },
    reloadPrice: function () {
        if (!this.config.isProductSelected) {
            return;
        }

        var imagesPrice = 0.0;
        var textsPrice = 0.0;
        var designAreasPrice = 0.0;
        var subTotal = 0.0;
        this.designPrices = {};

        if (this.prices.fixed_price > 0) {
            var fixedPrice = parseFloat(this.prices.fixed_price);
            var fixedPriceConfig = {
                price: fixedPrice,
                type: "fixed"
            };
            subTotal += fixedPrice;
            if (optionsPrice != undefined) {
                optionsPrice.addCustomPrices('design_fixed_price', fixedPriceConfig);
            }
            this.designPrices['fixed_price'] = fixedPrice;
        }

        for (var id in this.containerCanvases) {
            var canvas = this.containerCanvases[id];
            var designAreaPrice = 0;
            if (canvas && canvas != 'undefined') {
                var canvasCount = canvas.getObjects().length;
                if (canvasCount > 0) {
                    if (this.config.product.images[this.currentColor].hasOwnProperty(id)) {
                        var designArea = this.config.product.images[this.currentColor][id];
                        designAreaPrice = parseFloat(designArea.ip);
                        if (designAreaPrice > 0) {
                            designAreasPrice += designAreaPrice;
                            subTotal += designAreaPrice;
                        }
                        var imagesCount = 0;
                        var textsCount = 0;
                        var imagePrice = parseFloat(this.prices.image_text);
                        var textPrice = parseFloat(this.prices.text_price);
                        canvas.getObjects().each(function (object) {
                            if (object.type == 'text') {
                                textsCount++;
                                if (textPrice > 0) {
                                    textsPrice += textPrice;
                                    subTotal += textPrice;
                                }
                            } else if (object.type == 'image') {
                                imagesCount++;
                                if (imagePrice > 0) {
                                    imagesPrice += imagePrice;
                                    subTotal += imagePrice;
                                }
                            }
                        }.bind(this));
                        if (this.designPrices['images'] == undefined) {
                            this.designPrices['images'] = {};
                        }
                        this.designPrices['images'][id] = designAreaPrice
                        + (imagePrice * imagesCount) + (textPrice * textsCount);

                        if (this.designPrices['texts_count'] == undefined) {
                            this.designPrices['texts_count'] = textsCount;
                        } else {
                            this.designPrices['texts_count'] += textsCount;
                        }
                        if (this.designPrices['images_count'] == undefined) {
                            this.designPrices['images_count'] = imagesCount;
                        } else {
                            this.designPrices['images_count'] += imagesCount;
                        }
                    }
                }
            }
        }
        this.designPrices['sub_total'] = subTotal;
        this.designPrices['design_areas_price'] = designAreasPrice;
        this.designPrices['texts_price'] = textsPrice;
        this.designPrices['images_price'] = imagesPrice;

        if (optionsPrice != undefined) {
            optionsPrice.addCustomPrices('design_area_price', {price: designAreasPrice, type: 'fixed'});
            optionsPrice.addCustomPrices('design_text_price', {price: textsPrice, type: 'fixed'});
            optionsPrice.addCustomPrices('design_image_price', {price: imagesPrice, type: 'fixed'});
            optionsPrice.setDuplicateIdSuffix('-design');
            optionsPrice.reload();
        }

        this.updatePriceMoreInfo(this.designPrices);
    },

    observePriceMoreInfo: function () {
        Event.on($('design_price_container'), 'click', '#price-more-info-switcher', function (e, elm) {
            var moreInfoContainer = $('price-more-info');
            e.stop();
            if (moreInfoContainer) {
                moreInfoContainer.toggle();
            }
        });
    },

    updatePriceMoreInfo: function (prices) {
        $H(this.pricesContainers).each(function (pair) {
            if (prices.hasOwnProperty(pair.value.id)) {
                var price = prices[pair.value.id];
                if (price > 0 && $(pair.value).select('.price')[0]) {
                    var formattedPrice = optionsPrice.formatPrice(price);
                    $(pair.value).select('.price')[0].innerHTML = formattedPrice;
                    $(pair.value).show();
                } else if (price == 0) {
                    $(pair.value).hide();
                }
            }
        });
    },

    observeHelpIcons: function () {
        $$('.tab-help-icon').each(function (obj) {
            obj.observe('mouseover', function (e) {
                obj.next().show();
            });
            obj.observe('mouseout', function (e) {
                obj.next().hide();
            });
        }.bind(this));
    },

    observeGoOut: function () {
        if (window.onbeforeunload == null) {
            window.onbeforeunload = function () {
                return 'The current design will be lost. Are you sure that you want to leave this page?';
            }
        }
    },

    observeHistoryChanges: function () {
        Event.observe(document, 'PdChangeHistory', function (e) {
            var history = e.history;
            var history_object = e.history_object;

            if (history_object) {
                this.designChanged[this.currentColor] = history_object.isDesignChanged();
            } else if (history.undoStack.length > 0 && this.canvasesHasLayers()) {
                this.designChanged[this.currentColor] = true;
            } else {
                this.designChanged[this.currentColor] = false;
            }

            if (this.designChanged[this.currentColor]) {
                this.observeGoOut();
            } else {
                window.onbeforeunload = null
            }

            this.designId[this.currentColor] = null;
            this._toggleNavigationButtons('disabled');
            this._toggleHistoryButtons();
        }.bind(this));
    },

    _toggleNavigationButtons: function (className) {
        if (this.designChanged.hasOwnProperty(this.currentColor)
            && this.designChanged[this.currentColor] === true) {
            this.navigation.saveDesign.removeClassName(className);
            this.navigation.continue.removeClassName(className);
            this.navigation.share.removeClassName(className);
        } else if (!this.designChanged.hasOwnProperty(this.currentColor) ||
            (this.designChanged.hasOwnProperty(this.currentColor) && this.designChanged[this.currentColor] === false)) {
            this.navigation.saveDesign.addClassName(className);
            this.navigation.share.addClassName(className);
            if (!this.designId[this.currentColor]) {
                this.navigation.continue.addClassName(className);
            } else {
                this.navigation.continue.removeClassName(className);
            }
        }
    },

    _observeCanvasObjects: function () {
        this.observeCanvasObjectModified();
        this.observeCanvasObjectMoving();
        this.observeCanvasObjectSelected();
        this.observeCanvasObjectRendered();
        this.observeCanvasSelection();
    },

    _toggleControlsButtons: function () {

        if ((this.canvas == null) || this.canvas == 'undefined') {
            return;
        }

        var controls = this.config.controls;
        var layerControls = [];
        var method = this.canvas.getActiveObject() ? 'removeClassName' : 'addClassName';
        for (var k in controls) {
            if (k == 'undo') {
                method = this.history.undoStack.length ? 'removeClassName' : 'addClassName';
            } else if (k == 'redo') {
                method = this.history.redoStack.length ? 'removeClassName' : 'addClassName';
            } else if (controls.hasOwnProperty(k)) {
                method = this.canvas.getActiveObject() ? 'removeClassName' : 'addClassName';
            }
            var btn = $(controls[k]);
            btn[method].apply(btn, ['disabled']);
        }
        layerControls.invoke(method, 'disabled');
    },

    _toggleHistoryButtons: function () {
        if (this.history.undoStack.length == 0) {
            $(this.config.controls.undo).addClassName('disabled');
        } else {
            $(this.config.controls.undo).removeClassName('disabled');
        }

        if (this.history.redoStack.length == 0) {
            $(this.config.controls.redo).addClassName('disabled');
        } else {
            $(this.config.controls.redo).removeClassName('disabled');
        }
    }
};

GoMage.ProductNavigation = function (filterUrl, productUrl) {
    this.productDesigner = window.pd;
    this.opt = {
        filterUrl: filterUrl,
        productUrl: productUrl,
        navigationFiltersId: 'navigation-filters',
        navigationProducts: 'navigation_listing'
    };

    this.initProductView();
    this.observePager();
    this.observeFiltersChange();
    this.observeProductSelect();
};

GoMage.ProductNavigation.prototype = {
    initProductView: function () {
        Event.on($(this.opt.navigationProducts), 'mouseover', '.item', function (e, elm) {
            e.stop();
            var containerWidth = parseInt($(this.opt.navigationProducts).getWidth()) + 20;
            elm.down('.display-product').setStyle({
                display: 'block',
                left: containerWidth + 'px'
            });
        }.bind(this));

        Event.on($(this.opt.navigationProducts), 'mouseout', '.item', function (e, elm) {
            e.stop();
            var containerWidth = parseInt($(this.opt.navigationProducts).getWidth()) + 20;
            elm.down('.display-product').setStyle({
                display: 'none',
                left: containerWidth + 'px'
            });
        }.bind(this));
    },

    observePager: function () {
        var pagerLinks = $$('#' + this.opt.navigationProducts + ' .pager a');
        pagerLinks.invoke('observe', 'click', function (event) {
            event.stop();
            var pageHrefSplit = this.href.match('[&?]+p=([0-9]+)');
            var page;
            if (typeof pageHrefSplit[1] === 'undefined') {
                page = 0;
            } else {
                page = parseInt(pageHrefSplit[1]);
            }

            if (!isNaN(page)) {
                var data = [];
                data['p'] = page;
                this.prepareAndSubmitData(this.opt.filterUrl, this.updateDataOnFilterApply, data);
            }
        }.bind(this));
    },

    observeFiltersChange: function () {
        Event.on($(this.opt.navigationFiltersId), 'change', '.filter_selector', function (e, elm) {
            e.stop();
            var data = {};
            $$('.filter_selector').each(function (element) {
                data[element.name] = element.value;
            }.bind(this));

            this.prepareAndSubmitData(this.opt.filterUrl, this.updateDataOnFilterApply.bind(this), data);
        }.bind(this));
    },

    observeProductSelect: function () {
        Event.on($(this.opt.navigationProducts), 'click', '.product-image', function (e, elem) {
            e.stop();
            if (this._productChangeConfirmation()) {
                var productId = elem.getAttribute('data-product_id');
                if (!productId) {
                    return;
                }
                window.location.href = this.opt.productUrl + '?id=' + productId;
            }
        }.bind(this));
    },

    _productChangeConfirmation: function () {
        if (this.productDesigner.config.isProductSelected && window.onbeforeunload != null) {
            return window.confirm('The current design will be lost. Are you sure that you want change product?');
        }

        return true;
    },

    prepareAndSubmitData: function (url, callbackFunc, data) {
        if (typeof data === 'undefined') {
            var data = {};
        }
        data['ajax'] = true;

        new Ajax.DesignerRequest(url, {
            method: 'post',
            parameters: data,
            onSuccess: function (transport) {
                var response = transport.responseText.evalJSON();
                if (response.status == 'success') {
                    callbackFunc(response);
                    if (typeof data['id'] !== 'undefined') {
                        window.history.pushState({}, '', '//' + location.host + location.pathname + '?id=' + data['id']);
                    }
                } else if (response.status == 'error') {
                    alert('Something went wrong...');
                }
            }.bind(this),
            onFailure: function () {
                alert('Something went wrong...');
            }
        });
    },

    updateDataOnFilterApply: function (response) {
        if (response.navigation_filters) {
            $(this.opt.navigationFiltersId).update(response.navigation_filters);
        }

        if (response.navigation_prodcuts) {
            $(this.opt.navigationProducts).update(response.navigation_prodcuts);
        }
    }
};

GoMage.Designer = function (filterUrl) {
    this.opt = {
        filterUrl: filterUrl
    };
    this.productDesigner = window.pd;
    this.observeFilterFields();
    this.observeImageSelect();
};

GoMage.Designer.prototype = {
    observeImageSelect: function () {
        Event.on($('cliparts-list'), 'click', '.clipart-image', function (e, elm) {
            e.stop();
            var img = e.target || e.srcElement;
            var url = decodeURIComponent(img.getAttribute('data-origin-url'));
            fabric.Image.fromURL(url, function (image) {
                fabric.Image.fromURL(image.toDataURL(), function (obj) {
                    obj.set({tab: 'design'});
                    var scale = 1;
                    if (obj.getWidth() > (this.productDesigner.canvas.getWidth() / 2)) {
                        scale = (this.productDesigner.canvas.getWidth() / 2) / obj.getWidth();
                    }
                    if (scale != 1) {
                        obj.scale(scale);
                    }
                    var cmd = new InsertCommand(this.productDesigner, obj, true);
                    cmd.exec();
                    this.productDesigner.history.push(cmd);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },

    filterImages: function (data) {
        var data = data || {};
        data['ajax'] = true;
        if (data.hasOwnProperty('tags')) {
            if ($('mainCategoriesSearchField') && $('mainCategoriesSearchField').value) {
                data['mainCategory'] = $('mainCategoriesSearchField').value;
            }
            if ($('subCategoriesSearchField') && $('subCategoriesSearchField').value) {
                data['subCategory'] = $('subCategoriesSearchField').value;
            }
        } else if ($('tagsSearchField') && $('tagsSearchField').value) {
            data['tags'] = $('tagsSearchField').value;
        }

        new Ajax.DesignerRequest(this.opt.filterUrl, {
            method: 'post',
            parameters: data,
            onSuccess: function (transport) {
                var response = transport.responseText.evalJSON();
                if (response.status == 'success') {
                    if (response.hasOwnProperty('filters')) {
                        $('cliparts-filters').update(response.filters);
                        this.observeFilterFields();
                    }
                    if (response.hasOwnProperty('cliparts')) {
                        $('cliparts-list').update(response.cliparts);
                    }
                    if ($('tagsSearchField')) {
                        $('tagsSearchField').focus();
                    }
                } else {
                    alert('Something went wrong...');
                }
            }.bind(this),
            onFailure: function () {
                alert('Something went wrong...');
            }
        });
    },

    observeFilterFields: function () {
        if ($('cliparts-filters') && $('mainCategoriesSearchField') || $('subCategoriesSearchField')) {
            Event.stopObserving($('cliparts-filters'));
            Event.on($('cliparts-filters'), 'change', '#mainCategoriesSearchField, #subCategoriesSearchField', function (e, elm) {
                e.stop();
                var data = {};
                data[elm.name] = elm.value;
                if (elm.name == 'subCategory') {
                    data['mainCategory'] = $('mainCategoriesSearchField').value;
                }
                this.filterImages(data);
            }.bind(this));
        }

        if ($('tagsSearchField')) {
            Event.on($('cliparts-search-btn'), 'click', function (e, elm) {
                e.stop();
                if (!elm.hasClassName('disabled')) {
                    this.filterImages({tags: $('tagsSearchField').value});
                }
            }.bind(this));

            if ($('tagsSearchField').value) {
                $('cliparts-reset-btn').show();
            } else {
                $('cliparts-reset-btn').hide();
            }

            Event.on($('cliparts-reset-btn'), 'click', function (e, elm) {
                e.stop();
                $('tagsSearchField').value = '';
                this.filterImages();
            }.bind(this));

            Event.on($('tagsSearchField'), 'keypress', function (e, elm) {
                var key = e.which || e.keyCode;
                switch (key) {
                    default:
                        if (elm.value) {
                            $('cliparts-search-btn').removeClassName('disabled');
                        } else {
                            $('cliparts-search-btn').addClassName('disabled');
                        }
                        break;
                    case Event.KEY_RETURN:
                        this.filterImages({tags: elm.value});
                        e.stop();
                        break;
                }
            }.bind(this));

        }
    }


};

GoMage.TextEditor = function (defaultFontFamily, defaultFontSize) {
    this.productDesigner = window.pd;
    this.colorPicker = null;

    this.selected_colors = {
        color: '',
        textShadow: '',
        strokeStyle: ''
    };

    this.defaultTextOpt = {
        text: '',
        fontFamily: defaultFontFamily,
        fontSize: defaultFontSize,
        stroke: '',
        strokeWidth: 0,
        shadow: null
    };

    this.fontSelector = $('font-selector');

    this.addTextTextarea = $('add_text_textarea');
    this.addTextButton = $('add_text_button');
    this.addTextBtnBold = $('add_text_btn_bold');
    this.addTextBtnItalic = $('add_text_btn_italic');
    this.addTextBtnUnderline = $('add_text_btn_underline');
    this.addTextBtnStrokeThrough = $('add_text_btn_stroke_through');
    this.fontSizeSelector = $('font_size_selector');
    this.btnShadowText = $('shadow-button');
    this.btnOutlineText = $('outline-button');
    this.addTextColorsPanel = $('add_text_colors_panel');
    this.outlineStrokeWidthRange = $('outline_range');
    this.shadowOffsetX = $('shadow_x_range');
    this.shadowOffsetY = $('shadow_y_range');
    this.shadowBlur = $('shadow_blur');
    this.resetSettings = $('reset_text_settings');
    this.addMonogramText = $('monogram_text'); // mmc 2ten monogram
    this.designText = $('design_text'); // mmc 2ten monogram - stores typed monogram text in a form field

    this.fieldsMap = {
        text: this.addTextTextarea,
        fontFamily: this.fontSelector,
        fontSize: this.fontSizeSelector,
        strokeWidth: this.outlineStrokeWidthRange
    };

    this.defaultFieldsValues = {
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        shadowBlur: 5,
        shadowColor: '#000000',
        stroke: '#000000',
        strokeWidth: 0
    };

    this.observeTextTabShow();
    this.observeRemoveObject();
    this.initColorPickers();
    this.observeTextColorChange();
    this.observeFontChange();
    this.observeAddText();
    this.observeFontSizeChange();
    this.observeFontStyleControls();
    this.observeShadowButton();
    this.observeShadowControls();
    this.observeOutlineButton();
    this.observeOutlineControls();
    this.observeCancelTextEffect();
    this.observeResetSettings();
    // this.observeMonogramTab(); // mmc 2ten monogram

    // mmc add new text - simulates clicking on design area which deselects existing elements
    this.deselectButton = $('deselect');
    this.observeDeselect();
};

GoMage.TextEditor.prototype = {
    initColorPickers: function () {
        var colorPickers = $$('.color-picker');
        colorPickers.each(function (element) {
            this.colorPicker = new ColorPicker(element);
            this.colorPicker.getNode().observe('select', this.selectColorOnPicker.bind(this));
        }.bind(this));
    },

    selectColorOnPicker: function (e) {
        var elem = e.target || e.srcElement;
        var obj = this.productDesigner.canvas.getActiveObject();
        if (elem.id) {
            switch (elem.id) {
                case 'color':
                {
                    this.selected_colors.color = e.hex;
                    if (obj && obj.type == 'text') {
                        this.setTextColor(e.hex);
                    }
                    break;
                }
                case 'textShadow':
                {
                    this.selected_colors.textShadow = e.hex;
                    if (obj && obj.type == 'text') {
                        this.setShadow({shadowColor: e.hex});
                    }
                    break;
                }
                case 'strokeStyle':
                {
                    this.selected_colors.strokeStyle = e.hex;
                    if (obj && obj.type == 'text') {
                        var cmd = new TransformCommand(this.productDesigner.canvas, obj, {stroke: e.hex});
                        cmd.exec();
                        this.productDesigner.history.push(cmd);
                    }
                    break;
                }
            }
        }
    },

    /**
     * Set Text Color function
     */
    setTextColor: function (color) {
        var obj = this.productDesigner.canvas.getActiveObject();
        if (obj && obj.type == 'text') {
            var cmd = new TransformCommand(this.productDesigner.canvas, obj, {color: color});
            cmd.exec();
            this.productDesigner.history.push(cmd);
        }
    },

    observeTextColorChange: function () {
        this.addTextColorsPanel.childElements().invoke('observe', 'click', function (e) {
            var elem = e.target || e.srcElement;
            if (!elem.hasClassName('active')) {
                elem.siblings().invoke('removeClassName', 'active');
            }
            elem.addClassName('active');
            if (elem.className.match(/color-code-([0-9A-Z]{6})/)) {
                var color = elem.className.match(/color-code-([0-9A-Z]{6})/)[1];
                var color = '#' + color;
                this.setTextColor(color);
                $('color-picker-palitra').hide();
            } else {
                $('color-picker-palitra').toggle();
                if (!$('color-picker-palitra').visible()) {
                    elem.removeClassName('active');
                }
            }
        }.bind(this));
    },

    observeFontChange: function () {

        //@Fahad: Added support for selectBoxIt plugin to show the fonts dropdown in their own font styles
        var options = $$('select#font-selector option');
        var len = options.length;
        for (var i = 0; i < len; i++) {
            options[i].writeAttribute("data-text","<span style='font-family:\""+options[i].value+"\"'>"+options[i].text+"</span>")
        }
        jQuery("#font-selector").selectBoxIt(); //Apply selectboxIt plugin to the fonts dropdown
        //Bind the change event for selectBoxIt
        jQuery("select#font-selector").bind({
            "change": function(ev, obj) {
                var isObjectMonoType = false;
                var elem = jQuery(this).val();
                var textBox =  jQuery("#add_text_textarea");
                if(elem == 'Circle-Monograms-Three-White-Alt'){
                    textBox.attr("maxlength",3).attr("placeholder","3 Characters").addClass('input-monogram').val("");
                    jQuery('#font_code').val("30A");
                    jQuery('#character-limit').hide();
                    isObjectMonoType = true;
                    
                }else if(elem == 'Circle-Monograms-Two-White'){
                    textBox.attr("maxlength",2).attr("placeholder","2 Characters").addClass('input-monogram').val("");
                    jQuery('#font_code').val("32A");
                    jQuery('#character-limit').hide();
                    isObjectMonoType = true;
                }else if(elem == 'monogram-kk-sc'){
                    textBox.attr("maxlength",3).attr("placeholder","1-3 Characters").addClass('input-monogram').val("");
                    jQuery('#font_code').val("1");
                    jQuery('#character-limit').hide();
                    isObjectMonoType = true;
                }else{
                    jQuery("#add_text_textarea").removeAttr("maxlength").removeClass('input-monogram').attr("placeholder","Enter text here");
                    jQuery('#character-limit').show();
                    isObjectMonoType = false;
                }

                var obj = window.pd.canvas.getActiveObject();
                if (obj && obj.type == 'text') {
                    var c = window.pd.canvas;
                    if(isObjectMonoType){
                        c.remove(obj);
                        c.renderAll();
                    }else{
                        //Setting up text again to render things perfectly after change other fonts (specially for monograms)
                        obj.set("text",jQuery("#add_text_textarea").val());
                        var cmd = new TransformCommand(window.pd.canvas, obj, {fontFamily: elem});
                        cmd.exec();

                        // Raj centralise object after choosing font style
                        obj.center();
                        obj.setCoords();
                        c.calcOffset();
                        c.renderAll();
                        
                        window.pd.history.push(cmd);
                    }
                }

            }
        });
        //No longer needed this as we now have binded the selectBoxIt dropdown's change event
        this.fontSelector.observe('change', function (e) {
            var elem = e.target || e.srcElement;
            var obj = this.productDesigner.canvas.getActiveObject();
            if (obj && obj.type == 'text') {
                var cmd = new TransformCommand(this.productDesigner.canvas, obj, {fontFamily: elem.value});
                cmd.exec();
                this.productDesigner.history.push(cmd);
            }
        }.bind(this));
    },

    getTextColor: function () {
        var elem = this.addTextColorsPanel.down('.active');
        if (elem) {
            if (elem.hasClassName('color-picher')) {
                return this.selected_colors.color;
            } else if (elem.className.match(/color-code-([0-9A-Z]{6})/)) {
                var color = elem.className.match(/color-code-([0-9A-Z]{6})/)[1];
                var color = '#' + color;
                return color;
            }
        }

    },

    observeDeselect: function(e){
        // mmc 2ten clear canvas to add new text
        this.deselectButton.observe('click', function () {
            window.pd.canvas.deactivateAllWithDispatch().renderAll();
        });
    },

    observeAddText: function () {
        var timeout;
        this.addTextButton.observe('click', function () {
            if (!this.addTextTextarea.value) {
                return;
            }
            var obj = this.productDesigner.canvas.getActiveObject();
            if (obj && obj.type == 'text') {
                return;
            }
            var text = this.addTextTextarea.value;
            var textObjectData = {
                fontSize: parseInt(this.fontSizeSelector.value),
                fontFamily: this.fontSelector.value,
                lineHeight: 1,
                fontWeight: this.addTextBtnBold.hasClassName('active') ? 'bold' : 'normal',
                fontStyle: this.addTextBtnItalic.hasClassName('active') ? 'italic' : '',
                textDecoration: (this.addTextBtnUnderline.hasClassName('active') ? 'underline' : '') + (this.addTextBtnStrokeThrough.hasClassName('active') ? ' line-through' : '')
            };

            if (this.selected_colors.strokeStyle ||
                (this.outlineStrokeWidthRange.value != this.defaultFieldsValues.strokeWidth)) {
                textObjectData.stroke = this.selected_colors.strokeStyle;
                textObjectData.strokeWidth = parseFloat(this.outlineStrokeWidthRange.value);
            }

            var textObject = new fabric.Text(text, textObjectData);

            var color = this.getTextColor();
            if (color) {
                textObject.setColor(color);
            }

            if (this.selected_colors.textShadow ||
                this.shadowOffsetX.value ||
                this.shadowOffsetY.value ||
                this.shadowBlur.value) {
                var shadow = new fabric.Shadow();
                shadow.offsetX = this.shadowOffsetX.value;
                shadow.offsetY = this.shadowOffsetY.value;
                shadow.blur = this.shadowBlur.value;
                shadow.color = this.selected_colors.textShadow;
                textObject.setShadow(shadow);
            }

            var cmd = new InsertCommand(this.productDesigner, textObject, true);
            cmd.exec();
            this.productDesigner.history.push(cmd);
            this._changeTextButtonLabel(textObject);
        }.bind(this));

        this.addTextTextarea.observe('keyup', function (e) {
            var obj = this.productDesigner.canvas.getActiveObject();
            if (!obj || obj.type != 'text') {
                //@Fahad: we need to create a new textbox here

                var keycode = e.keyCode;
                var valid =
                    (keycode > 47 && keycode < 58)   || // number keys
                    keycode == 32 || keycode == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
                    (keycode > 64 && keycode < 91)   || // letter keys
                    (keycode > 95 && keycode < 112)  || // numpad keys
                    (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
                    (keycode > 218 && keycode < 223);   // [\]' (in order)

               if(valid) //if the entered text is printable text
               {
                    var text = this.addTextTextarea.value;
                   // mmc 2ten monogram todo function that processes test thru correct filter if isMonogram
                   var textObjectData = {
                       fontSize: parseInt(this.fontSizeSelector.value),
                       //fontSize: 75,
                       fontFamily: this.fontSelector.value,
                       lineHeight: 1,
                       hasControls: $j('#pd_container').data('has-controls'),
                       // mmc locks scaling
                       lockScalingX: $j('#pd_container').data('lock-scaling'),
                       lockScalingY: $j('#pd_container').data('lock-scaling'),
                       // mmc opacity
                       opacity: 0.85,
                       fontWeight: this.addTextBtnBold.hasClassName('active') ? 'bold' : 'normal',
                       fontStyle: this.addTextBtnItalic.hasClassName('active') ? 'italic' : '',
                       textDecoration: (this.addTextBtnUnderline.hasClassName('active') ? 'underline' : '') + (this.addTextBtnStrokeThrough.hasClassName('active') ? ' line-through' : '')
                   };

                   if (this.selected_colors.strokeStyle ||
                       (this.outlineStrokeWidthRange.value != this.defaultFieldsValues.strokeWidth)) {
                       textObjectData.stroke = this.selected_colors.strokeStyle;
                       textObjectData.strokeWidth = parseFloat(this.outlineStrokeWidthRange.value);
                   }

                   var textObject = new fabric.Text(text, textObjectData);

                   var color = this.getTextColor();
                   if (color) {
                       textObject.setColor(color);
                   }

                   if (this.selected_colors.textShadow ||
                       this.shadowOffsetX.value ||
                       this.shadowOffsetY.value ||
                       this.shadowBlur.value) {
                       var shadow = new fabric.Shadow();
                       shadow.offsetX = this.shadowOffsetX.value;
                       shadow.offsetY = this.shadowOffsetY.value;
                       shadow.blur = this.shadowBlur.value;
                       shadow.color = this.selected_colors.textShadow;
                       textObject.setShadow(shadow);
                   }

                   //@Fahad: Added default gray shadow

                   textObject.setColor('#666666');
                   var shadow = new fabric.Shadow();
                   shadow.offsetX = 0;
                   shadow.offsetY = 0;
                   shadow.blur = 0;
                   shadow.color = '#222222';

                   textObject.setShadow(shadow);
                   //shadow:{'color':'red','blur':0,'offsetX':-10,'offsetY':-10}
                   var cmd = new InsertCommand(this.productDesigner, textObject, true);
                   cmd.exec();
                   this.productDesigner.history.push(cmd);
                   this._changeTextButtonLabel(textObject);
               }
            }

            //For first case when object created input box
            var obj = this.productDesigner.canvas.getActiveObject();
            if (timeout != 'undefined' || timeout != null) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(function () {
                var elem = e.target || e.srcElement;
                if (!elem.value) {
                    this.productDesigner.layersManager.removeById(obj.get('uid'));
                    return;
                }
                var currentValue = elem.value;
                if (obj && obj.type == 'text') {
                    //if (currentValue != obj.getText()) {
                        // RajNew
                        // mmc 2ten monogram todo need a function that translates monogram font
                        var isMonogram = this.isMonogram(this.fontSelector.value);
                        if(isMonogram){
                            currentValue = this.monogramTranslate(currentValue);
                        }
                        
                        var cmd = new TransformCommand(this.productDesigner.canvas, obj, {text: currentValue});
                        cmd.exec();
                        obj.center(); //@Fahad: Center the text while typing
                        this.productDesigner.history.push(cmd);
                    //}
                }
            }.bind(this), 10);
        }.bind(this));
    },




// RajNew
isMonogram: function(font){
    var fontNameLower = font.toLowerCase();
    if(fontNameLower.indexOf('monogram') !== -1){
        return true;
    }else{
        return false;
    }
},
monogramTranslate: function(text){
    // get the font we are using
    var font_code = jQuery('#font_code').val();
    
    // set the family, getting info from the function that stores the font info
    var font_family = this.productDesigner.getMonogramFont(font_code);
    
    // set default family
    if (!font_family) {
        font_code = '30A';
        font_family = this.productDesigner.getMonogramFont('30A');
    }
    // setting the form value to default if was empty
    jQuery('#font_code').val(font_code);

    var textUpper = text.toUpperCase();
    var theText = this.productDesigner.transformMonogramText(font_code, textUpper);

    return theText;
},




    observeFontSizeChange: function () {

        //mmc to add support for jquery ui
        jQuery("#font_size_selector").selectBoxIt();
        jQuery("select#font_size_selector").bind({
            "change": function(ev, obj) {
                var elem = jQuery(this).val();
                var obj = window.pd.canvas.getActiveObject();
                if (obj && obj.type == 'text') {
                    var c = window.pd.canvas;
                    var cmd = new TransformCommand(c, obj, {fontSize: elem});
                    cmd.exec();

                    //centralise object after choosing font style
                    obj.center();
                    obj.setCoords();
                    c.calcOffset();
                    c.renderAll();

                    window.pd.history.push(cmd);
                }
            }
        });

        // mmc not needed above is getting font size change
        this.fontSizeSelector.observe('change', function (e) {
            var elem = e.target || e.srcElement;
            var obj = this.productDesigner.canvas.getActiveObject();
            if (obj && obj.type == 'text') {
                var cmd = new TransformCommand(this.productDesigner.canvas, obj, {fontSize: parseInt(elem.value)});
                cmd.exec();
                this.productDesigner.history.push(cmd);
            }
        }.bind(this));
    },

    changeControlState: function (control, active) {
        if (typeof active === 'undefined') {
            active = !control.hasClassName('active');
        }
        if (active) {
            control.addClassName('active');
        } else {
            control.removeClassName('active');
        }
    },

    observeFontStyleControls: function () {
        this.addTextBtnBold.observe('click', function (e) {
            this.changeControlState(this.addTextBtnBold);
            var obj = this.productDesigner.canvas.getActiveObject();
            if (obj && obj.type == 'text') {
                var params = {fontWeight: (this.addTextBtnBold.hasClassName('active') ? 'bold' : 'normal')};
                var cmd = new TransformCommand(this.productDesigner.canvas, obj, params);
                cmd.exec();
                this.productDesigner.history.push(cmd);
            }
        }.bind(this));

        this.addTextBtnItalic.observe('click', function (e) {
            this.changeControlState(this.addTextBtnItalic);
            var obj = this.productDesigner.canvas.getActiveObject();
            if (obj && obj.type == 'text') {
                var params = {fontStyle: (this.addTextBtnItalic.hasClassName('active') ? 'italic' : '')};
                var cmd = new TransformCommand(this.productDesigner.canvas, obj, params);
                cmd.exec();
                this.productDesigner.history.push(cmd);
            }
        }.bind(this));

        this.addTextBtnUnderline.observe('click', function (e) {
            this.changeControlState(this.addTextBtnUnderline);
            var obj = this.productDesigner.canvas.getActiveObject();
            if (obj && obj.type == 'text') {
                var params = {textDecoration: (this.addTextBtnUnderline.hasClassName('active') ? 'underline' : '') + (this.addTextBtnStrokeThrough.hasClassName('active') ? ' line-through' : '')};
                var cmd = new TransformCommand(this.productDesigner.canvas, obj, params);
                cmd.exec();
                this.productDesigner.history.push(cmd);
            }
        }.bind(this));

        this.addTextBtnStrokeThrough.observe('click', function (e) {
            this.changeControlState(this.addTextBtnStrokeThrough);
            var obj = this.productDesigner.canvas.getActiveObject();
            if (obj && obj.type == 'text') {
                var params = {textDecoration: (this.addTextBtnUnderline.hasClassName('active') ? 'underline' : '') + (this.addTextBtnStrokeThrough.hasClassName('active') ? ' line-through' : '')};
                var cmd = new TransformCommand(this.productDesigner.canvas, obj, params);
                cmd.exec();
                this.productDesigner.history.push(cmd);
            }
        }.bind(this));
    },

    toggleConfigContainer: function (elem) {
        var configClass = elem.id.replace('-button', '-config');
        var configElement = $$('.' + configClass)[0];
        configElement.siblings().invoke('setStyle', {display: 'none'});
        $$('.panel-btn2').invoke('removeClassName', 'active');
        if (configElement.getStyle('display') == 'none') {
            elem.addClassName('active');
            configElement.setStyle({display: 'block'});
        } else {
            configElement.setStyle({display: 'none'});
        }
    },

    observeResetSettings: function () {
        this.resetSettings.observe('click', function (e) {
            var obj = this.productDesigner.canvas.getActiveObject();

            this.fontSelector.value = this.defaultTextOpt.fontFamily;
            this.fontSizeSelector.value = this.defaultTextOpt.fontSize;

            [this.addTextBtnBold, this.addTextBtnItalic,
                this.addTextBtnUnderline, this.addTextBtnStrokeThrough,
                this.btnShadowText, this.btnOutlineText].invoke('removeClassName', 'active');

            $$('.shadow-config, .outline-config').invoke('hide');
            this.addTextColorsPanel.childElements().invoke('removeClassName', 'active');
            $('color-picker-palitra').hide();
            this.selected_colors = {
                color: '',
                textShadow: '',
                strokeStyle: ''
            };

            this.outlineStrokeWidthRange.value = 0;
            this.shadowOffsetX.value = 0;
            this.shadowOffsetY.value = 0;
            this.shadowBlur.value = 0;

            if (obj && obj.type == 'text') {
                var textObjectData = {
                    fontSize: parseInt(this.fontSizeSelector.value),
                    fontFamily: this.fontSelector.value,
                    lineHeight: 1,
                    fontWeight: 'normal',
                    fontStyle: '',
                    textDecoration: '',
                    stroke: '',
                    strokeWidth: 0,
                    shadow: null,
                    color: '#000000'
                };
                var cmd = new TransformCommand(this.productDesigner.canvas, obj, textObjectData);
                cmd.exec();
                this.productDesigner.history.push(cmd);
            }

        }.bind(this));
    },

    observeCancelTextEffect: function () {
        $$('.panel-cancel-btn').invoke('observe', 'click', function (e) {
            var elm = e.target || e.srcElement;
            this.cancelTextEffect(elm);
        }.bind(this));
    },

    cancelTextEffect: function (elm) {
        var btn = $(elm.id.replace('-cancel', '-button'));
        if (btn) {
            this.toggleConfigContainer(btn);
        }

        var obj = this.productDesigner.canvas.getActiveObject();
        if (!obj || obj.type != 'text') {
            return;
        }

        var params = {};
        if (elm.getAttribute('data-effect') == 'outline') {
            this.fieldsMap.strokeWidth.value = 0;
            params['strokeWidth'] = 0;
            params['stroke'] = '';
            this.selected_colors.strokeStyle = '';
        } else if (elm.getAttribute('data-effect') == 'shadow') {
            params['shadow'] = null;
        }

        var cmd = new TransformCommand(this.productDesigner.canvas, obj, params);
        cmd.exec();
        this.productDesigner.history.push(cmd);
    },

    observeShadowButton: function () {
        this.btnShadowText.observe('click', function (e) {
            var elem = e.target || e.srcElement;
            this.toggleConfigContainer(elem);

            var obj = this.productDesigner.canvas.getActiveObject();
            if (obj && obj.type == 'text') {
                if (obj.shadow == null) {
                    this.setShadow({
                        shadowOffsetX: this.defaultFieldsValues.shadowOffsetX,
                        shadowOffsetY: this.defaultFieldsValues.shadowOffsetY,
                        shadowBlur: this.defaultFieldsValues.shadowBlur,
                        shadowColor: this.defaultFieldsValues.shadowColor
                    })
                }
            }
        }.bind(this));
    },

    observeShadowControls: function () {
        var shadowOffsetY = this.shadowOffsetY;
        var shadowOffsetX = this.shadowOffsetX;
        var shadowBlur = this.shadowBlur;

        if (!shadowOffsetY || !shadowOffsetX || !shadowBlur) {
            return;
        }

        shadowOffsetY.observe('change', function (e) {
            var elem = e.target || e.srcElement;
            this.setShadow({shadowOffsetY: parseInt(elem.value)});
        }.bind(this));

        shadowOffsetX.observe('change', function (e) {
            var elem = e.target || e.srcElement;
            this.setShadow({shadowOffsetX: parseInt(elem.value)});
        }.bind(this));

        shadowBlur.observe('change', function (e) {
            var elem = e.target || e.srcElement;
            this.setShadow({shadowBlur: parseInt(elem.value)});
        }.bind(this));
    },

    setShadow: function (shadowParams) {
        var obj = this.productDesigner.canvas.getActiveObject();
        if (obj && obj.type == 'text') {
            var shadow = obj.shadow;
            if (shadow == null) {
                shadow = new fabric.Shadow();
            }
            if (shadowParams != undefined) {
                if (shadowParams.hasOwnProperty('shadowOffsetX')) {
                    shadow.offsetX = shadowParams.shadowOffsetX;
                }
                if (shadowParams.hasOwnProperty('shadowOffsetY')) {
                    shadow.offsetY = shadowParams.shadowOffsetY;
                }
                if (shadowParams.hasOwnProperty('shadowBlur')) {
                    shadow.blur = shadowParams.shadowBlur;
                }
                if (shadowParams.hasOwnProperty('shadowColor')) {
                    shadow.color = shadowParams.shadowColor;
                }
            }

            var cmd = new TransformCommand(this.productDesigner.canvas, obj, {shadow: shadow});
            cmd.exec();
        }
    },

    observeOutlineButton: function () {
        this.btnOutlineText.observe('click', function (e) {
            var elem = e.target || e.srcElement;
            this.toggleConfigContainer(elem);

            var obj = this.productDesigner.canvas.getActiveObject();
            if (obj && obj.type == 'text') {
                if (obj.strokeWidth == 0) {
                    var cmd = new TransformCommand(this.productDesigner.canvas, obj, {
                        strokeWidth: this.defaultFieldsValues.strokeWidth,
                        stroke: this.defaultFieldsValues.stroke
                    });
                    this.fieldsMap.strokeWidth.value = this.defaultFieldsValues.strokeWidth;
                    cmd.exec();
                    this.productDesigner.history.push(cmd);
                }
            }
        }.bind(this));
    },

    observeOutlineControls: function () {
        if (!this.outlineStrokeWidthRange) {
            return;
        }
        this.outlineStrokeWidthRange.observe('change', function (e) {
            var elem = e.target || e.srcElement;
            var obj = this.productDesigner.canvas.getActiveObject();
            if (!obj || obj.type != 'text') {
                return;
            }
            var cmd = new TransformCommand(this.productDesigner.canvas, obj, {strokeWidth: parseFloat(elem.value)});
            cmd.exec();
        }.bind(this));
    },

    observeTextTabShow: function () {
        document.observe('textTabShow', function (e) {
            var textObj = e.obj || null;
            this._setInputValues(textObj);
        }.bind(this));
    },

    observeRemoveObject: function () {
        document.observe('removeObject', function (e) {
            this._changeTextButtonLabel();
        }.bind(this));

        if (this.productDesigner.canvas) {
            this.productDesigner.canvas.observe('selection:cleared', function (e) {
                this._changeTextButtonLabel();
            }.bind(this));
        }
    },

    _changeTextArea(font){

        var fontNameLower = font.toLowerCase();
        var textBox =  jQuery("#add_text_textarea");
        if(font == 'circle-monograms-three-white-alt'){
            textBox.attr("maxlength",3).attr("placeholder","3 Characters").addClass('input-monogram').val("");
            jQuery('#font_code').val("_");
            jQuery('#character-limit').hide();
            isObjectMonoType = true;
            
        }else if(font == 'circle-monograms-two-white'){
            textBox.attr("maxlength",2).attr("placeholder","2 Characters").addClass('input-monogram').val("");
            jQuery('#font_code').val("32A");
            jQuery('#character-limit').hide();
            isObjectMonoType = true;
        }else if(font == 'monogram-kk-sc'){
            textBox.attr("maxlength",3).attr("placeholder","1-3 Characters").addClass('input-monogram').val("");
            jQuery('#font_code').val("1");
            jQuery('#character-limit').hide();
            isObjectMonoType = true;
        }else{
            textBox.removeAttr("maxlength").removeClass('input-monogram').attr("placeholder","Enter text here");
            jQuery('#character-limit').show();
            isObjectMonoType = false;
        }
        return isObjectMonoType;

    },

    _setInputValues: function (textObj) {
        console.log('SET');
        var font = (textObj.fontFamily);
        var fontNameLower = font.toLowerCase();
        this._changeTextButtonLabel(textObj);
        for (var property in this.fieldsMap) {
            if (this.fieldsMap.hasOwnProperty(property) && this.fieldsMap[property]) {
                var field = this.fieldsMap[property];
                var objText = textObj[property];
                if(property==='text' && fontNameLower == 'circle-monograms-three-white-alt'){
                    objText = _convertMonoToSimpleText(textObj);
                }
                if(property==='text'){
                    this._changeTextArea(fontNameLower);
                }
                field.value = textObj ? objText : this.defaultTextOpt[property];
            }
        }

        //Add selectboxit plugin for the text - april 2018
        if(textObj && textObj.type=='text'){

            //Selectbox font-family
            jQuery("#font-selector").val((textObj.fontFamily).toString());
            jQuery("#font-selector").selectBoxIt().data("selectBox-selectBoxIt").refresh();
            
            //Selectbox fontSize
            jQuery("#font_size_selector").val((textObj.fontSize).toString());
            jQuery("#font_size_selector").selectBoxIt().data("selectBox-selectBoxIt").refresh();
        }

        if (textObj) {
            this.changeControlState(this.addTextBtnBold, textObj.get('fontWeight') == 'bold');
            this.changeControlState(this.addTextBtnItalic, textObj.get('fontStyle') == 'italic');
            this.changeControlState(this.addTextBtnUnderline, textObj.get('textDecoration').indexOf('underline') >= 0);
            this.changeControlState(this.addTextBtnStrokeThrough, textObj.get('textDecoration').indexOf('line-through') >= 0);

            var color = textObj.getFill();
            $('color-picker-palitra').hide();
            this.addTextColorsPanel.childElements().invoke('removeClassName', 'active');
            if (color.match(/#([0-9A-Za-z]{6})/)) {
                color = color.replace('#', '');
                if (this.addTextColorsPanel.down('.color-code-' + color)) {
                    this.addTextColorsPanel.down('.color-code-' + color).addClassName('active');
                } else {
                    this.selected_colors.color = '#' + color;
                    this.addTextColorsPanel.down('.color-picher').addClassName('active');
                    $('color-picker-palitra').show();
                }
            }

            if (textObj.getStroke()) {
                this.selected_colors.strokeStyle = textObj.getStroke();
            }

            var shadow = textObj.getShadow();
            if (shadow) {
                this.shadowOffsetX.value = shadow.offsetX;
                this.shadowOffsetY.value = shadow.offsetY;
                this.shadowBlur.value = shadow.blur;
                this.selected_colors.textShadow = shadow.color;
            } else {
                this.shadowOffsetX.value = 0;
                this.shadowOffsetY.value = 0;
                this.shadowBlur.value = 0;
                this.selected_colors.textShadow = '';
            }

        }

    },

    _changeTextButtonLabel: function (obj) {
        if (obj) {
            this.addTextButton.innerHTML = 'Edit Text';
        } else {
            this.addTextButton.innerHTML = 'Add Text';
            //@Fahad: If deselected the text field, remove the old text from the textarea
            // as it might confuse the users as if they are editing the old text or adding a new
            this.addTextTextarea.value = '';
        }
    },

    /* ----------- monogram functions ------------ */


    fitTextToArea: function (obj) {
        if (obj.getWidth() > (this.productDesigner.canvas.getWidth())
            || obj.getHeight() > (this.productDesigner.canvas.getHeight())) {
            console.log("Decreasing size")
            this.decreaseTextFontSizeToFitArea(obj);
            //console.log("done Decreasing size")
        } else {
            console.log("increasing size")
            this.increaseTextFontSizeToFitArea(obj);
            //console.log("done increasing size")
        }
    },

    decreaseTextFontSizeToFitArea: function (obj) {
        var horizontal = obj.angle == 0;
        var fontSizeModified = false;
        var minFontSize = jQuery('#font_size_selector option:first').val();
        var canvas_height = this.productDesigner.canvas.getHeight();
        var canvas_width = this.productDesigner.canvas.getWidth();
        var landscape = Math.round(canvas_height / canvas_width) <= 1;
        var is_single_character = (obj.text && obj.text.length == 1);
        var maxCounter = 20;
        if(is_single_character) {
            //canvas_height = Math.round(canvas_height * 5 / 6);
        }
        while (parseInt(this.fontSizeSelector.value) > minFontSize &&
        (horizontal ? (obj.getWidth() > canvas_width || obj.getHeight() > canvas_height) :
            (obj.getWidth() > canvas_height) || (obj.getHeight() > canvas_width))) {
            jQuery('#font_size_selector option:selected').attr('selected', false).prev().attr('selected', 'selected');

            var cmd = new TransformCommand(this.productDesigner.canvas, obj, {fontSize: parseInt(this.fontSizeSelector.value)});
            cmd.exec();

            obj.center();

            fontSizeModified = true;
            maxCounter--;
            if(maxCounter<=0)
                break;
        }

        if (obj.font_type == 'monogram') {
            var font = this.productDesigner.fonts()[obj.font_code];
            if (!font)
                return;

            if(fontSizeModified) {
                for (var i = 0; i < font.sizeReduction; i++) {
                    if (parseInt(this.fontSizeSelector.value) > minFontSize) {
                        jQuery('#font_size_selector option:selected').attr('selected', false).prev().attr('selected', 'selected')
                        var cmd = new TransformCommand(this.productDesigner.canvas, obj, {fontSize: parseInt(this.fontSizeSelector.value)});
                        cmd.exec();

                        obj.center();
                    }
                }
            }

            if(!landscape || !is_single_character) {
                var cmd = new AlignToCenterThirdCommand(this.productDesigner.canvas, obj);
                cmd.exec();
            }

            if (font.top) {
                var top_adjustment = Math.round((canvas_width * font.top * canvas_width) / (canvas_height * 100));
                var cmd = new TransformCommand(this.productDesigner.canvas, obj, {top: obj.top + top_adjustment});
                cmd.exec();
            }

            if (font.left) {
                var left_adjustment = Math.round((canvas_width * font.left) / 100);
                var cmd = new TransformCommand(this.productDesigner.canvas, obj, {left: obj.left + left_adjustment});
                cmd.exec();
            }
        }
    },

    increaseTextFontSizeToFitArea: function (obj) {
        var horizontal = obj.angle == 0;

        var maxFontSize = jQuery('#font_size_selector option:last').val();
        var maxCounter = 20;
        while (parseInt(this.fontSizeSelector.value) < maxFontSize &&
        (horizontal ? (obj.getWidth() < this.productDesigner.canvas.getWidth()) && obj.getHeight() < (this.productDesigner.canvas.getHeight()) :
            (obj.getWidth() < (this.productDesigner.canvas.getHeight())) && (obj.getHeight() < (this.productDesigner.canvas.getWidth())))) {
            jQuery('#font_size_selector option:selected').attr('selected', false).next().attr('selected', 'selected');

            var cmd = new TransformCommand(this.productDesigner.canvas, obj, {fontSize: parseInt(this.fontSizeSelector.value)});
            cmd.exec();

            obj.center();
            maxCounter--;
            if(maxCounter<=0)
                break;
        }

        this.decreaseTextFontSizeToFitArea(obj);
    },

    /* mmc 2ten monogram main function */
    observeMonogramTab: function () {
        var timeout;

        this.addMonogramText.observe('keyup', function (e) {

            // mmc uppercase
            this.addMonogramText.value = this.addMonogramText.value.toUpperCase();

            // set hidden form field to value
            this.designText.value = this.addMonogramText.value;

            // get the active object on the canvas
            var obj = this.findTextObject();

            if (!obj) {

                // set text to form value
                var text = this.addMonogramText.value;

                // set hidden form field value to text
                this.designText.value = text;

                // get the font we are using
                var font_code = jQuery('#font_code').val();

                // set the family, getting info from the function that stores the font info
                var font_family = this.productDesigner.getMonogramFont(font_code);

                // set default family
                if (!font_family) {
                    font_code = '30A';
                    font_family = this.productDesigner.getMonogramFont('30A');
                }

                // setting the form value to default if was empty
                jQuery('#font_code').val(font_code);

                // mmc dynamic font size
                var canvas_height = this.productDesigner.canvas.getHeight();
                var font_size = canvas_height - 10;

                // create the text object
                var textObjectData = {
                    fontSize: font_size,//parseInt(this.fontSizeSelector.value), // todo mmc 2ten make dynamic maybe set this to height-10px
                    fontFamily: font_family,
                    lineHeight: 1,
                    opacity: 0.85,
                    // hasControls: $j('#pd_container').data('has-controls'),
                    // // mmc locks scaling
                    // lockScalingX: $j('#pd_container').data('lock-scaling'),
                    // lockScalingY: $j('#pd_container').data('lock-scaling'),
                    // mmc not needed fontWeight: this.addTextBtnBold.hasClassName('active') ? 'bold' : 'normal',
                    // mmc not needed fontStyle: this.addTextBtnItalic.hasClassName('active') ? 'italic' : '',
                    // mmc not needed textDecoration: (this.addTextBtnUnderline.hasClassName('active') ? 'underline' : '') + (this.addTextBtnStrokeThrough.hasClassName('active') ? ' line-through' : ''),
                    // selectable: false,
                    // hasBorders:false,
                    // hasControls:false,
                };

                // mmc remove stroke
                // if (this.selected_colors.strokeStyle ||
                //     (this.outlineStrokeWidthRange.value != this.defaultFieldsValues.strokeWidth)) {
                //     textObjectData.stroke = this.selected_colors.strokeStyle;
                //     textObjectData.strokeWidth = parseFloat(this.outlineStrokeWidthRange.value);
                // }

                // take the fontcode and the text and transform it to custom chars required by the font
                text = this.productDesigner.transformMonogramText(font_code, text);

                // create the text object with the new text
                var textObject = new fabric.Text(text, textObjectData);

                // not sure this is needed, might be only for the other sites implementation
                // mmc todo check this
                // mmc 2ten type: monogram to keep on the monogram tab
                textObject.set({tab: 'monogram', font_type: 'monogram'});

                // todo hard code this 
                var color = this.getTextColor();
                if (color) {
                    textObject.setColor(color);
                }

                // todo remove, hard code see above
                if (this.productDesigner.textTheme == 'dark') {
                    textObject.setColor("#000000");
                } else {
                    // -------------Set color to Silver---------------//
                    textObject.setColor("#666666");
                }

                // todo shadow hard code
                if (this.selected_colors.textShadow ||
                    this.shadowOffsetX.value ||
                    this.shadowOffsetY.value ||
                    this.shadowBlur.value) {
                    var shadow = new fabric.Shadow();
                    shadow.offsetX = this.shadowOffsetX.value;
                    shadow.offsetY = this.shadowOffsetY.value;
                    shadow.blur = this.shadowBlur.value;
                    shadow.color = this.selected_colors.textShadow;
                    textObject.setShadow(shadow);
                }

                // standard stuff that product designer does
                var cmd = new InsertCommand(this.productDesigner, textObject, true);
                cmd.exec();
                this.productDesigner.history.push(cmd);
                this._changeTextButtonLabel(textObject);

                // fits to area of canvas - seems rotation handle interferes have disabled this
                this.fitTextToArea(textObject);
            }

            if (timeout != 'undefined' || timeout != null) {
                clearTimeout(timeout);
            }

            // seems to run all the above code every second to check for changes
            // and set those change on the object on the canvas
            timeout = setTimeout(function () {
                var elem = e.target || e.srcElement;
                if (!elem.value) {
                    if (obj) {
                        this.productDesigner.layersManager.removeById(obj.get('uid'));
                    }
                    return;
                }
                var currentValue = elem.value;
                if (obj && obj.type == 'text') {
                    var font_code = jQuery('#font_code').val();

                    var font_family = this.productDesigner.getMonogramFont(font_code);
                    if (!font_family) {
                        font_code = '29A';
                        font_family = this.productDesigner.getMonogramFont('29A');
                    }

                    jQuery('#font_code').val(font_code);
                    obj.set({font_code: font_code});

                    currentValue = this.productDesigner.transformMonogramText(font_code, currentValue);

                    if (font_family != obj.fontFamily) {

                        var cmd = new TransformCommand(this.productDesigner.canvas, obj, {fontFamily: font_family});
                        cmd.exec();
                        this.productDesigner.history.push(cmd);

                        cmd = new AlignToCenterCommand(this.productDesigner.canvas, obj);
                        cmd.exec();
                        this.productDesigner.history.push(cmd);

                        this.fitTextToArea(obj);
                    }

                    if (currentValue != obj.getText()) {
                        this.designText.value = elem.value;

                        var cmd = new TransformCommand(this.productDesigner.canvas, obj, {text: currentValue});
                        cmd.exec();
                        this.productDesigner.history.push(cmd);

                        cmd = new AlignToCenterCommand(this.productDesigner.canvas, obj);
                        cmd.exec();
                        this.productDesigner.history.push(cmd);

                        this.fitTextToArea(obj);

                    }


                }
            }.bind(this), 1000);
        }.bind(this));
    },

    findTextObject: function () {
        var obj = this.productDesigner.canvas.getActiveObject();

        if (!obj || obj.type != 'text') {
            this.productDesigner.canvas.forEachObject(function (o) {
                if ((this.productDesigner.canvas == null) || this.productDesigner.canvas == 'undefined') {
                    return;
                }

                if (o && o.type == 'text') {
                    obj = o;

                    return false;
                }
            }.bind(this));
        }

        return obj;
    }
    /* ----------- end monogram functions ------------ */

};

GoMage.ImageUploader = function (maxUploadFileSize, allowedImageExtensions, allowedImageExtensionsFormated, removeImgUrl, uploadImgUrl) {
    this.maxUploadFileSize = maxUploadFileSize;
    this.allowedImageExtension = allowedImageExtensions;
    this.allowedImageExtensionsFormated = allowedImageExtensionsFormated;
    this.removeImgUrl = removeImgUrl;
    this.uploadImgUrl = uploadImgUrl;

    this.productDesigner = window.pd;

    this.dropZone = $('upload-image-drop-zone');
    this.observeLicenseAgreements();
    this.observeLicenseAgreementsMoreInfo();
    window.onload = this.observeDropImage.bind(this);
    this.observeUploadImage();
    this.observeImageSelect();
    this.observeRemoveImages();

};

GoMage.ImageUploader.prototype = {

    observeLicenseAgreements: function () {
        if (!$('licence_agreements')) {
            return;
        }
        $('licence_agreements').observe('click', function () {
            var inputWrapper = this.dropZone;
            if (inputWrapper.getStyle('display') == 'none') {
                inputWrapper.setStyle({display: 'block'});
            } else {
                inputWrapper.setStyle({display: 'none'});
            }
        }.bind(this));
    },

    observeLicenseAgreementsMoreInfo: function () {
        if (!$('license-agreements-link')) {
            return;
        }

        $('license-agreements-link').observe('mouseover', function () {
            $('license-agreemants').show();
        }.bind(this));

        $('license-agreements-link').observe('mouseout', function () {
            $('license-agreemants').hide();
        }.bind(this));
    },

    observeUploadImage: function () {
        $('uploadImages').onsubmit = function () {
            if ($('filesToUpload')) {
                if (this._validateUploadedFiles($('filesToUpload').files)) {
                    showLoadInfo();
                    $('uploadImages').target = 'iframeSave';
                    $('iframeSave').onload = function () {
                        var response = window.frames['iframeSave'].document.body.innerHTML;
                        $('uploadedImages').update(response);
                        $('filesToUpload').value = '';
                        $('remove-img-btn').show();
                        hideLoadInfo();
                    }.bind(this);
                }
            }
        }.bind(this);
    },

    observeDropImage: function () {

        this.dropZone.down('a').observe('click', function () {
            $('file-input-box').show();
        });

        this.dropZone.ondragover = this.dropZone.ondragenter = function (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        this.dropZone.ondrop = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var files = event.dataTransfer.files;
            if (this._validateUploadedFiles(files)) {
                showLoadInfo();
                var formData = new FormData();
                for (var i = 0; i < files.length; i++) {
                    formData.append('filesToUpload[]', files[i]);
                }
                var xhr = new XMLHttpRequest();
                xhr.open('POST', this.uploadImgUrl);
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        $('uploadedImages').update(xhr.response);
                        $('remove-img-btn').show();
                        hideLoadInfo();
                    }
                };
                xhr.send(formData);
            }
        }.bind(this);
    },

    _validateUploadedFiles: function (files) {
        var errorContainer = $('upload-image-error');
        var errors = {};
        var errorsCount = 0;
        errorContainer.innerHTML = '';
        errorContainer.hide();

        if (files.length > 0) {
            for (var prop in files) {
                if (files.hasOwnProperty(prop)) {
                    var file = files[prop];
                    if (file.size && file.size > this.maxUploadFileSize) {
                        errors['size'] = 'You can not upload files larger than ' + this.maxUploadFileSize / 1024 / 1024 + ' MB';
                    }
                    if (file.type && this.allowedImageExtension.indexOf(file.type) < 0) {
                        errors['type'] = 'Cannot upload the file. The format is not supported. Supported file formats are: ' + this.allowedImageExtensionsFormated;
                    }
                }
            }
        } else {
            errors['count'] = 'Please, select file for upload';
        }

        for (var prop in errors) {
            if (errors.hasOwnProperty(prop)) {
                errorsCount++;
                errorContainer.insert('<p>' + errors[prop] + '</p>');
            }
        }

        if (errorsCount > 0) {
            errorContainer.show();
            return false;
        } else {
            errorContainer.hide();
        }

        return true;
    },

    observeRemoveImages: function () {
        $('remove-img-btn').observe('click', function () {
            this.removeImages();
        }.bind(this));
    },

    removeImages: function () {
        new Ajax.DesignerRequest(this.removeImgUrl, {
            method: 'post',
            parameters: {ajax: true},
            onSuccess: function (transport) {
                var response = transport.responseText.evalJSON();
                var errorContainer = $('upload-image-error');
                errorContainer.innerHTML = '';
                errorContainer.hide();
                if (response.status == 'success') {
                    $('uploadedImages').update(response.content);
                    $('remove-img-btn').hide();
                    $('filesToUpload').value = '';
                } else if (response.status == 'error') {
                    errorContainer.insert('<p>' + response.message + '</p>');
                    errorContainer.show();
                }
            }.bind(this)
        });
    },

    observeImageSelect: function () {
        Event.on($('uploadedImages'), 'click', '.clipart-image', function (e, elm) {
            e.stop();
            var img = e.target || e.srcElement;
            var url = decodeURIComponent(img.getAttribute('data-origin-url'));

            fabric.Image.fromURL(url, function (image) {
                fabric.Image.fromURL(image.toDataURL(), function (obj) {
                    obj.set({tab: 'upload'});
                    var scale = 1;
                    if (obj.getWidth() > (this.productDesigner.canvas.getWidth() / 2)) {
                        scale = (this.productDesigner.canvas.getWidth() / 2) / obj.getWidth();
                    }
                    if (scale != 1) {
                        obj.scale(scale);
                    }
                    var cmd = new InsertCommand(this.productDesigner, obj, true);
                    cmd.exec();
                    this.productDesigner.history.push(cmd);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }
};


// COLOR PICKER
var ColorPicker = function (canvasObj) {
    var self = this;
    var canvas = canvasObj;

    var colorctx = canvas.getContext('2d');
    var gradient = colorctx.createLinearGradient(0, 0, canvas.width, 0);

    gradient.addColorStop(0, 'rgb(255,   0,   0)');
    gradient.addColorStop(0.15, 'rgb(255,   0, 255)');
    gradient.addColorStop(0.33, 'rgb(0,     0, 255)');
    gradient.addColorStop(0.49, 'rgb(0,   255, 255)');
    gradient.addColorStop(0.67, 'rgb(0,   255,   0)');
    gradient.addColorStop(0.84, 'rgb(255, 255,   0)');
    gradient.addColorStop(1, 'rgb(255,   0,   0)');

    colorctx.fillStyle = gradient;
    colorctx.fillRect(0, 0, canvas.width, canvas.height);

    gradient = colorctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(0,     0,   0, 0)');
    gradient.addColorStop(1, 'rgba(0,     0,   0, 1)');

    colorctx.fillStyle = gradient;
    colorctx.fillRect(0, 0, canvas.width, canvas.height);

    this.ctx = colorctx;
    this.palete = canvas;

    canvas.observe('click', function (e) {
        var c = canvas.cumulativeOffset();
        var x = e.pageX - c.left;
        var y = e.pageY - c.top;

        var pixel = colorctx.getImageData(x, y, 1, 1);
        var color = 'rgb(' + pixel.data[0] + ', ' + pixel.data[1] + ', ' + pixel.data[2] + ')';

        var event = document.createEvent('Event');

        event.rgb = color;
        event.hex = self.rgbToHex(pixel.data[0], pixel.data[1], pixel.data[2]);

        event.initEvent('select', true, true);
        canvas.dispatchEvent(event);
    });
};

ColorPicker.prototype = {
    rgbToHex: function (r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    getNode: function () {
        return this.palete;
    }
};
// END OF COLOR PICKER


// ------------------------------------------------------
// Layers manager
// ------------------------------------------------------
var LayersManager = function (w) {
    var self = this;
    // link on Workspace
    this.w = w;
    // active layer ID
    this.active = null;
    // layers array
    this.layers = {};
    // layers which are outside of borders
    this.outside = {};

    document.observe('PdLayerSelect', function (e) {
        var obj = e.obj;
        if (self.active == obj.get('uid')) {
            return;
        }
        self.active = obj.get('uid');

        var element_id = '';
        if (obj.type == 'image') {
            if (obj.tab == 'design' && this.w.config.isDesignedEnabled) {
                element_id = 'pd_add_design';
            } else if (obj.tab == 'upload' && this.w.config.isUploadImageEnabled) {
                element_id = 'pd_add_image';
            }
        } else if (obj.type == 'text' && this.w.config.isTextEnabled) {
            element_id = 'pd_add_text';
            var event = document.createEvent('Event');
            event.obj = obj;
            event.initEvent('textTabShow', true, true);
            document.dispatchEvent(event);
        }

        if (element_id && (element = $(element_id))) {
            element.siblings().invoke('removeClassName', 'active');
            element.addClassName('active');
            var content_element = $(element_id + '-content');
            content_element.siblings().invoke('hide');
            content_element.setStyle({display: 'block'});
        }
        this.w._toggleControlsButtons();
    }.bind(this));

    document.observe('PdLayerBlur', function (e) {
        if (self.active == null) return;
        self.active = null;
    });
};

LayersManager.prototype = {
    add: function (obj) {
        this.active = obj.get('uid');
        this.layers[this.active] = obj;
    },

    remove: function (obj) {
        this.removeById(obj.get('uid'));
    },

    removeById: function (id) {
        if (!this.layers[id]) {
            return;
        }
        var cmd = new RemoveCommand(this.w, this.layers[id]);
        cmd.exec();
        this.w.history.push(cmd);
        this.layers[id] = null;
    },

    removeOnlyLayer: function (obj) {
        if (!obj) {
            return;
        }
        var id = obj.get('uid');
        this.layers[id] = null;
    },

    setActive: function (id) {
        if (this.active == id) return;
        this.w.canvas.setActiveObject(this.layers[id]);
        this.active = id
    },

    markAsOutside: function (id) {
        if (this.outside[id] == true) return;
        this.outside[id] = true;
    },

    removeOutsideMark: function (id) {
        if (!this.outside[id]) return;
        this.outside[id] = false;
    },

    up: function (id) {

    },

    down: function (id) {

    },

    fireSelectEvent: function (obj) {
        var event = document.createEvent('Event');
        event.obj = obj;
        event.initEvent('PdLayerSelect', true, true);
        document.dispatchEvent(event);
    },

    fireBlurEvent: function () {
        var event = document.createEvent('Event');
        event.initEvent('PdLayerBlur', true, true);
        document.dispatchEvent(event);
    },

    clear: function () {
        this.layers = {};
        this.active = null;
        this.outside = {};
    }
};

// ------------------------------------------------------
// History managment
// ------------------------------------------------------
var HistoryObject = function (cmd) {
    var cmd = cmd;
    var design_changed = !($('pd_save_design').hasClassName('disabled'));
    return {
        getCommand: function () {
            return cmd;
        },
        isDesignChanged: function () {
            return design_changed;
        }
    };
}

var History = function () {
    this.undoStack = [];
    this.redoStack = [];
    this.limit = 50;
};

History.prototype = {
    push: function (cmd) {
        var history_object = new HistoryObject(cmd);
        this.undoStack.push(history_object);
        this.fireChangeEvent();
    },

    undo: function () {
        var history_object = this.undoStack.pop();
        if (!history_object) return;
        var cmd = history_object.getCommand();
        if (!cmd) return;
        cmd.unexec();
        this.redoStack.push(history_object);
        this.fireChangeEvent(history_object);
    },

    redo: function () {
        var history_object = this.redoStack.pop();
        if (!history_object) return;
        var cmd = history_object.getCommand();
        if (!cmd) return;
        cmd.exec();
        this.undoStack.push(history_object);
        this.fireChangeEvent(history_object);
    },

    clear: function () {
        this.undoStack = [];
        this.redoStack = [];
    },

    last: function () {
        var stack = this.undoStack;
        return stack[stack.length - 1];
    },

    fireChangeEvent: function (history_object) {
        var event = document.createEvent('Event');
        event.history = this;
        event.history_object = history_object;
        event.initEvent('PdChangeHistory', true, true);
        document.dispatchEvent(event);
    }
};

/**
 * Insert object
 */
var InsertCommand = function (w, obj, alignByCenter) {
    var c = w.canvas;
    // set unique ID
    obj.set('uid', 'id_' + Date.now());
    // set image_id
    obj.set('image_id', w.currentProd);
    return {
        exec: function () {
            // add object on canvas
            c.add(obj);
            // add object to layers manager
            w.layersManager.add(obj);
            // alignment
            if (alignByCenter) {
                obj.center();
            }
            c.setActiveObject(obj);
            obj.setCoords();
            c.renderAll();
            w.reloadPrice();
        },
        unexec: function () {
            w.layersManager.removeOnlyLayer(obj);
            c.remove(obj);
            w.reloadPrice();
        }
    };
};

/**
 * Remove object
 */
var RemoveCommand = function (w, obj) {
    var c = w.canvas;
    return {
        exec: function () {
            w.layersManager.removeOutsideMark(obj.get('uid'));
            w.layersManager.removeOnlyLayer(obj);
            c.remove(obj);
            w.reloadPrice();
        },
        unexec: function () {
            c.add(obj);
            c.setActiveObject(obj);
            if ((obj.left + obj.width / 2 <= 0) || (obj.left - obj.width / 2 >= c.getWidth())) {
                obj.center();
            } else if ((obj.top + obj.height / 2 <= 0) || (obj.top - obj.height / 2 >= c.getHeight())) {
                obj.center();
            }
            obj.setCoords();
            c.renderAll();
            w.layersManager.add(obj);
            w.reloadPrice();
        }
    }
};

/**
 * Object transformation
 */
var TransformCommand = function (canvas, obj, params) {
    var state = {};
    for (var k in params) {
        if (params.hasOwnProperty(k)) {
            state[k] = obj[k];
        }
    }

    var update = function (obj, conf) {
        for (var k in conf) {
            if (!params.hasOwnProperty(k)) {
                continue;
            }
            if (typeof obj['set' + $ucfirst(k)] == 'function') {
                obj['set' + $ucfirst(k)](conf[k]);
            } else {
                obj[k] = conf[k];
            }
        }
    };

    return {
        type: 'transform',
        state: params,
        exec: function () {
            update(obj, params);
            canvas.renderAll();
        },
        unexec: function () {
            update(obj, state);
            canvas.renderAll();
        }
    };
};

/**
 * Object moving
 */
var MovingCommand = function (c, obj, original, current) {
    return {
        exec: function () {
            obj.setLeft(current.left);
            obj.setTop(current.top);
            obj.setCoords();
            c.setActiveObject(obj);
            c.renderAll();
        },
        unexec: function () {
            obj.setLeft(original.left);
            obj.setTop(original.top);
            obj.setCoords();
            c.setActiveObject(obj);
            c.renderAll();
        }
    };
};

/**
 * Rotating object
 */
var RotateCommand = function (c, obj, original, current) {
    return {
        exec: function () {
            obj.setAngle(current.angle);
            obj.setCoords();
            c.setActiveObject(obj);
            c.renderAll();
        },
        unexec: function () {
            obj.setAngle(original.angle);
            obj.setCoords();
            c.setActiveObject(obj);
            c.renderAll();
        }
    }
};

/**
 * Resizing object
 */
var ResizeCommand = function (c, obj, original, current) {
    return {
        exec: function () {
            obj.scaleX = current.scaleX;
            obj.scaleY = current.scaleY;
            obj.setCoords();
            c.setActiveObject(obj);
            c.renderAll();
        },
        unexec: function () {
            obj.scaleX = original.scaleX;
            obj.scaleY = original.scaleY;
            obj.setCoords();
            c.setActiveObject(obj);
            c.renderAll();
        }
    }
};

/**
 * Flip command
 */
var FlipCommand = function (c, obj, original, current) {
    return {
        exec: function () {
            obj.flipX = current.flipX;
            obj.flipY = current.flipY;
            c.setActiveObject(obj);
            c.renderAll();
        },
        unexec: function () {
            obj.flipX = original.flipX;
            obj.flipY = original.flipY;
            c.setActiveObject(obj);
            c.renderAll();
        }
    }
};

/**
 * Special command for alignment object by canvas center
 */
var AlignToCenterCommand = function (c, obj) {
    // save original state
    var state = {left: obj.left, top: obj.top};
    return {
        exec: function () {
            obj.center();
            obj.setCoords();
            c.setActiveObject(obj);
            c.renderAll();
        },
        unexec: function () {
            obj.setLeft(state.left);
            obj.setTop(state.top);
            obj.setCoords();
            c.setActiveObject(obj);
            c.renderAll();
        }
    };
};

var ChangePositionCommand = function (c, obj, pos) {
    return {
        exec: function () {
            if (pos == 'front') {
                c.bringToFront(obj);
            } else if (pos == 'back') {
                c.sendToBack(obj);
            }
            c.setActiveObject(obj);
            c.renderAll();
        },
        unexec: function () {
            if (pos == 'front') {
                c.sendToBack(obj);
            } else if (pos == 'back') {
                c.bringToFront(obj);
            }
            c.setActiveObject(obj);
            c.renderAll();
        }
    };
};

var GroupCommand = function (cmds) {
    return {
        exec: function () {
            cmds.each(function (element) {
                element.exec();
            });
        },
        unexec: function () {
            cmds.each(function (element) {
                element.unexec();
            });
        }
    };
};
/*************** monogram function *************/
var AlignToCenterThirdCommand = function (c, obj) {
    // save original state
    var state = {left: obj.left, top: obj.top};
    return {
        exec: function () {

            obj.center();

            var obj_height = c.getHeight();
            var canvas_height = c.getHeight();

            var new_top = parseInt(canvas_height * 0.35 - obj.getFontSize() / 2)
            //if(new_top > obj_height/2)
            obj.setTop(new_top);
            obj.setCoords();

            //console.log({obj: obj_height, canvas: canvas_height, oldCenter: obj_center, center: obj.getCenterPoint(), top: new_top});
            c.setActiveObject(obj);
            c.renderAll();
        },
        unexec: function () {
            obj.setLeft(state.left);
            obj.setTop(state.top);
            obj.setCoords();
            c.setActiveObject(obj);
            c.renderAll();
        }
    };
};
/*************** end monogram function *************/

Ajax.DesignerRequest = Class.create(Ajax.Request, {
    initialize: function ($super, url, options) {
        options.onCreate = showLoadInfo;
        options.onComplete = hideLoadInfo;
        $super(url, options);
    }
});

function showLoadInfo() {
    if ($('designer-load-info')) {
        $('designer-load-info').addClassName('loading').show(); // mmc 2ten added
    }
}

function hideLoadInfo() {
    if ($('designer-load-info')) {
        $('designer-load-info').removeClassName('loading').hide(); // mmc 2ten added
    }
}

/**
 * @private
 * @param {CanvasRenderingContext2D} ctx Context to render on
 * @param {Array} textLines Array of all text lines
 */
fabric.Text.prototype._renderTextDecoration = function (ctx, textLines) {
    if (!this.textDecoration) {
        return;
    }

    // var halfOfVerticalBox = this.originY === 'top' ? 0 : this._getTextHeight(ctx, textLines) / 2;
    var halfOfVerticalBox = this._getTextHeight(ctx, textLines) / 1.5,
        _this = this;


    /** @ignore */
    function renderLinesAtOffset(offset) {
        for (var i = 0, len = textLines.length; i < len; i++) {

            var lineWidth = _this._getLineWidth(ctx, textLines[i]),
                lineLeftOffset = _this._getLineLeftOffset(lineWidth),
                lineHeight = Math.ceil(_this.fontSize / 24) * (_this.fontWeight == 'bold' ? 2 : 1);

            ctx.fillRect(
                _this._getLeftOffset() + lineLeftOffset,
                ~~((offset + (i * _this._getHeightOfLine(ctx, i, textLines))) - halfOfVerticalBox),
                lineWidth,
                lineHeight);
        }
    }

    if (this.textDecoration.indexOf('underline') > -1) {
        renderLinesAtOffset(this.fontSize * this.lineHeight);
    }
    if (this.textDecoration.indexOf('line-through') > -1) {
        renderLinesAtOffset(this.fontSize * this.lineHeight - this.fontSize / 2);
    }
    if (this.textDecoration.indexOf('overline') > -1) {
        renderLinesAtOffset(this.fontSize * this.lineHeight - this.fontSize);
    }
}