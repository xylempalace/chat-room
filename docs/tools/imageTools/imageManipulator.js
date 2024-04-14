class ImageManipulator {
	static canvas;
	static context;
	static queue = [];

	static canvasReady = false;

	/**
	 * Initializes the canvas used for manipulating images
	 */
	static init () {
		// Create the canvas and create references to it and its context
		ImageManipulator.canvas = document.createElement("canvas");
		ImageManipulator.canvas.id = "ImageManipulatorCanvas";
		ImageManipulator.context = ImageManipulator.canvas.getContext("2d");

		// Update the flag to allow for image processing once the canvas is ready
		ImageManipulator.canvasReady = true;
	}

	/** 
	*
	* @param {Image} image The image being manipulated
	* @param {Array<String>} args List of arguments that determine how the image is manipulated, if argument requires a parameter, leave a space between the argument and the parameter
	* @returns {Image} The manipulated image
	*/
	static manip(image, args) {
		if (!ImageManipulator.canvasReady) {
			throw new Error("Canvas is not initialized! Call init() on this class before manipulating images!");
		}
		
		try {
			return new Promise(resolve => {

				// Create new Image Object
				let output = new Image();
				output.crossOrigin="anonymous"
				// Create new event listener to detect once the image has loaded
				output.addEventListener("load", (e) => {

					if (image.src === output.src) {
						// Restore canvas to blank state
						ImageManipulator.context.save();
						ImageManipulator.canvas.width = image.width;
						ImageManipulator.canvas.height = image.height;
						ImageManipulator.context.clearRect(0, 0, ImageManipulator.canvas.width, ImageManipulator.canvas.height);

						// Preform canvas manipulations
						args.forEach((i) => {
							ImageManipulator.alterCanvas(i, image);
							//ImageManipulator.context.scale(-1, 1);
							//ImageManipulator.context.translate(-ImageManipulator.canvas.width, 0);
						});

						// Draw the image onto the manipulated canvas
						ImageManipulator.context.drawImage(output, 0, 0);

						// Remove this code from the event listener to prevent an infinite loop
						output.removeEventListener("load", this)

						// Save the canvas as the image's reference
						output.src = ImageManipulator.canvas.toDataURL("image/png");

						// Clean up transformations
						ImageManipulator.context.save();

						// Resolve the promise
						resolve(output);
					}
				});

				// Set the source of the image (this triggers the 'load' event)
				output.src = image.src;
			});
		} catch (e) {
			throw (e);
		}
	}

	static alterCanvas(argument, image) {
		let params = argument.split(' ');
		let arg = params[0];
		params.shift();

		switch (arg) {
			case 'flipX':
                // Flips everything drawn over the y axis
				ImageManipulator.context.scale(-1, 1);
				ImageManipulator.context.translate(-ImageManipulator.canvas.width, 0);
				break;

			case 'flipY':
                // Flips everything drawn over the x axis
				ImageManipulator.context.scale(1, -1);
				ImageManipulator.context.translate(0, -ImageManipulator.canvas.height);
				break;

			case 'translate':
                // Move where the canvas is rendering, eg a canvas is translated right 5 then an image drawn at position 7 will be drawn at position 2
				ImageManipulator.context.translate(params[0], params[1]);
				break;

			case 'scale':
                // Set the scale of the current context
				ImageManipulator.context.scale(params[0], params[1]);
				break;

            case 'canvasScale':
                // Set the width and height of the canvas
                ImageManipulator.canvas.width = params[0];
                ImageManipulator.canvas.height = params[1];
                break;
		}
	}
}