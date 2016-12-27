var Tab = {
	_animationDuration: 500,

	_open: false,

	isOpen: function() {
		return this._open;
	},

	_setOpen: function(val) {
		this._open = val;
	},

	open: function() {
		if (this._accordion) {
			if (this._accordion._getOpenTab()) {
				this._accordion._getOpenTab().close();
			}
			this._accordion._setOpenTab(this);
		}

		this._setOpen(true);
		this._$tabEl.attr('aria-expanded', this._open);
		this._$tabContentOuter.removeClass(this._hideClass).height(this._$tabContentInner.outerHeight());
	},

	close: function() {
		if (this._accordion) {
			this._accordion._setOpenTab(null);
		}

		this._setOpen(false);
		this._$tabEl.attr('aria-expanded', this._open);
		this._$tabContentOuter.height(0);
		setTimeout(() => {
				this._$tabContentOuter.addClass(this._hideClass);
			},
			this._animationDuration);
	},

	init: function(options) {
		['tab', 'accordion', 'tabHeader', 'tabContentOuter', 'tabContentInner', 'hideClass']
			.forEach(option => {
				if (options.hasOwnProperty(option)) {
					this['_' + option] = options[option];
				}
			});

		this._$tabEl = $(this._tab);
		this._$tabContentOuter = this._$tabEl.find(this._tabContentOuter).addClass(this._hideClass);
		this._$tabContentInner = this._$tabEl.find(this._tabContentInner);

		this._open = this._$tabEl.attr('aria-expanded') === 'false' ? false : true;
		var cssTransitionDuration = this._$tabContentOuter.css('transition-duration');
		if (cssTransitionDuration) {
			this._animationDuration = parseFloat(cssTransitionDuration) * 1000;
		}
		this._$tabHeader = this._$tabEl.find(this._tabHeader);
		this._$tabHeader.on('click',
				() => {
					this.isOpen() ? this.close() : this.open();
		});

		this._$tabEl.on('keydown', (e) => {
			if (e.target !== this._$tabHeader[0] && e.target !== this._$tabEl[0]) {
				return;
			}

			switch (e.keyCode) {
				case 13: //intentional fallthrought
				case 32:
					this._$tabHeader.trigger('click');
					break;
				case 35: //End
					if (this._accordion) {
						this._accordion._focusTab('last');
					}
					break;
				case 36: //Home
					if (this._accordion) {
						e.preventDefault();
						this._accordion._focusTab('first');
					}
					break;
				case 38: //up
					if (this._accordion) {
						this._accordion._focusTab('prev', this);
					}
					break;
				case 40: //down
					if (this._accordion) {
						this._accordion._focusTab('next', this);
					}
					break;
			}
		});

		return this;
	}
};

var Accordion = {
	_tabs: [],

	_openTab: null,

	_setOpenTab: function(tab) {
		var proto = this;
		while (!proto.hasOwnProperty('_openTab')) {
			proto = Object.getPrototypeOf(proto);
		}
		proto._openTab = tab;
	},

	_getOpenTab: function() {
		return this._openTab;
	},

	_focusTab(tabToFocus, currentTab) {
		var $tabToFocus;
		var tabIndex;

		switch (tabToFocus) {
			case 'first':
				$tabToFocus = this._tabs[0]._$tabEl;
				break;
			case 'last':
				$tabToFocus = this._tabs[this._tabs.length - 1]._$tabEl;
				break;
			case 'prev':
				tabIndex = Math.max(0, this._tabs.indexOf(currentTab) - 1);
				$tabToFocus = this._tabs[tabIndex]._$tabEl;
				break;
			case 'next':
				tabIndex = Math.min(this._tabs.length - 1, this._tabs.indexOf(currentTab) + 1);
				$tabToFocus = this._tabs[tabIndex]._$tabEl;
				break;
		}

		if ($tabToFocus) {
			$tabToFocus.focus();
		}
	},

	init: function(customOptions) {
		var defaultOptions = {
			accordionContainer: '.accordion',
			tabContainer: '.tabContainer',
			tabHeader: '.tabHeader',
			tabContentOuter: '.tabContentOuter',
			tabContentInner: '.tabContentInner',
			hideClass: 'hide'
		};
		var options = $.extend({}, defaultOptions, customOptions);

		['accordionContainer', 'tabContainer', 'tabHeader', 'tabContentOuter', 'tabContentInner', 'hideClass']
			.forEach(option => {
				if (options.hasOwnProperty(option)) {
					this['_' + option] = options[option];
				}
			});

		var tabOptions = {
			tabHeader: this._tabHeader,
			tabContentOuter: this._tabContentOuter,
			tabContentInner: this._tabContentInner,
			hideClass: this._hideClass,
			accordion: this
		};

		$(this._tabContainer, this._accordionContainer).toArray().forEach(tab => {
			tabOptions.tab = tab;
			this._tabs.push(Object.create(Tab).init(tabOptions));
		});

		return this;
	}
};

/**
 * @desc create an accordion object
 */
function createAccordion(options) {
	return Object.create(Accordion).init(options);
}

/**
 * @desc create a tab object
 */
function createTab(options) {
	return Object.create(Tab).init(options);
}


