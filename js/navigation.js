export class Navigation {
	// Define object to hold relevant DOM elements for the Navigation
	DOM = {
		// The main DOM element for the Gallery
		el: null,
		// prev and next elements
		prev: {el: null, arrow: null, galleryItems: []},
		next: {el: null, arrow: null, galleryItems: []},
	};

	/**
	 * Constructor for the Gallery class
	 * @param {HTMLElement} DOM_el - The main DOM element for the Gallery.
	 */
	constructor(DOM_el) {
		// Main gallery DOM element
		this.DOM.el = DOM_el;
		
		this.DOM.prev.el = this.DOM.el.querySelector('.nav__item--prev');
		this.DOM.prev.arrow = this.DOM.prev.el.querySelector('.nav__item-arrow');
		this.DOM.next.el = this.DOM.el.querySelector('.nav__item--next');
		this.DOM.next.arrow = this.DOM.next.el.querySelector('.nav__item-arrow');
	}

	/**
	 * Adds gallery items to either the 'next' or 'prev' DOM elements
	 * and also updates the 'galleryItems' array of either 'next' or 'prev' in the DOM object.
	 * It can accept either a single gallery item or an array of gallery items as input.
	 *
	 * @param {string} action - Indicates whether to add items to the 'next' or 'prev' DOM element. Expected values: 'next' or 'prev'.
	 * @param {HTMLElement | HTMLElement[]} galleryItems - A single gallery item or an array of gallery items to be added. 
	 */
	addGalleryItems(action, galleryItems) {
		// If galleryItems is not an array, make it one
		if (!Array.isArray(galleryItems)) {
			galleryItems = [galleryItems];
		}
		
		// Now we can use the spread operator to append all items to the 'next' or 'prev' DOM element 
		// and push them to the respective 'galleryItems' array
		this.DOM[action].el.append(...galleryItems);
		this.DOM[action].galleryItems.push(...galleryItems);
	}
}