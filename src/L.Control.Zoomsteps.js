L.Control.Zoomsteps = L.Control.extend({
	options: {
		position: 'topleft'
	},

	onAdd: function (map) {
		var zoomName = 'leaflet-control-zoom',
		    container = L.DomUtil.create('div', zoomName + ' leaflet-bar');

		this._map = map;

		this._zoomInButton  = this._createButton(
		        '+', 'Zoom in', zoomName + '-in', '', container, this._zoomIn,  this);
		
		this._zoomStepButtons = [];
		
		if (this._zoomLevels() > 0) {
			for (var i = this._map._layersMaxZoom; i >= this._map._layersMinZoom; i--) {
				
				var className = zoomName + '-step';
				
				if (this._map._zoom >= i) {
					className += ' leaflet-active-step';
				}
				
				this._zoomStepButtons.push(this._createButton(
				        i, 'Zoom '+i, className, i + '-step-' + zoomName , container, this._zoomToStep,  this));
			}
		}
		
		this._zoomOutButton = this._createButton(
		        '-', 'Zoom out', zoomName + '-out', '', container, this._zoomOut, this);

		map.on('zoomend zoomlevelschange', this._updateUI, this);
		
		return container;
	},

	onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateUI, this);
	},

	_zoomIn: function (e) {
		this._map.zoomIn(e.shiftKey ? 3 : 1);
	},

	_zoomOut: function (e) {
		this._map.zoomOut(e.shiftKey ? 3 : 1);
	},

	_zoomToStep: function (e) {
		var step = parseInt(e.toElement.id.split('-')[0]);
		this._map.setZoom(step);
	},
	
	_zoomLevels: function () {
		var zoomLevels = this._map._layersMaxZoom - this._map._layersMinZoom + 1;
		return zoomLevels < Infinity ? zoomLevels : 0;
	},

	_createButton: function (html, title, className, idName, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.id = idName;
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
		    .on(link, 'click', stop)
		    .on(link, 'mousedown', stop)
		    .on(link, 'dblclick', stop)
		    .on(link, 'click', L.DomEvent.preventDefault)
		    .on(link, 'click', fn, context);

		return link;
	},

	_updateUI: function () {
		var map = this._map,
			disabledClassName = 'leaflet-disabled',
			activeStepClassName = 'leaflet-active-step';
			
		var steps = this._zoomStepButtons.length,
		    step = null;
		
		for (var i = 0; i < steps; i++) {
			
			step = this._zoomStepButtons[i];
			L.DomUtil.removeClass(step, activeStepClassName);
			
			var stepId = parseInt(step.id.split('-')[0]);
			if (map._zoom >= stepId) {
				L.DomUtil.addClass(step, activeStepClassName);
			}
			
		}

		L.DomUtil.removeClass(this._zoomInButton, disabledClassName);
		L.DomUtil.removeClass(this._zoomOutButton, disabledClassName);
		
		if (map._zoom === map.getMinZoom()) {
			L.DomUtil.addClass(this._zoomOutButton, disabledClassName);
		}
		if (map._zoom === map.getMaxZoom()) {
			L.DomUtil.addClass(this._zoomInButton, disabledClassName);
		}
	}
});

L.Map.mergeOptions({
	zoomControl: false,
	zoomstepsControl: false
});

L.Map.addInitHook(function () {
	if (this.options.zoomstepsControl) {
		this.zoomstepsControl = new L.Control.Zoomsteps();
		this.addControl(this.zoomstepsControl);
	}
});

L.control.zoomsteps = function (options) {
	return new L.Control.Zoomsteps(options);
};