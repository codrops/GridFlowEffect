export class Gallery {
	// Define object to hold relevant DOM elements for the Gallery
	DOM = {
		// The main DOM element for the Gallery
		el: null,
        // NodeList of gallery item elements
        items: null,
	};
    isCurrent = false;

	/**
     * Constructor for the Gallery class
     * @param {HTMLElement} DOM_el - The main DOM element for the Gallery.
     */
	constructor(DOM_el) {
		// Main gallery DOM element
		this.DOM.el = DOM_el;
		// Gallery items
        this.DOM.items = [...this.DOM.el.querySelectorAll('.gallery__item')];
	}
}