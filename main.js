const puppeteer = require("puppeteer");

async function checkPageView(url, numRuns = 3) {
	const allDetectedEvents = [];

	for (let run = 1; run <= numRuns; run++) {
		const browser = await puppeteer.launch({ headless: "new" });
		const page = await browser.newPage();

		// Enable network monitoring
		await page.setRequestInterception(true);

		// Arrays to store detected events
		const detectedEvents = [];

		// Intercept network requests
		page.on("request", (request) => {
			// Check if the request payload contains 'eventName'
			if (request.postData() && request.postData().includes("eventName")) {
				const requestData = JSON.parse(request.postData());
				const { eventName, eventId } = requestData;

				detectedEvents.push({ eventName, eventId });

				// Continue the request
				request.continue();
			} else {
				// Allow all other requests to continue
				request.continue();
			}
		});

		// Navigate to the specified URL
		await page.goto(url);

		// Close the browser
		await browser.close();

		// Log detected events if any
		if (detectedEvents.length > 0) {
			/* console.log(`Run ${run} - Detected Events:`);
			console.table(detectedEvents); */

			console.log(`✅ Tracking events in progress for run ${run}...`);
		} else {
			console.log(`⚠️  No events with eventName detected on the specified URL in  Run ${run} -`);
		}

		// Accumulate detected events from each run
		allDetectedEvents.push(...detectedEvents);
	}

	// Log a final table with all detected events
	if (allDetectedEvents.length > 0) {
		console.log("Final Table - All Detected Events:");
		console.table(allDetectedEvents);
	} else {
		console.log("No events with eventName detected in any run.");
	}
}

// Replace 'https://example.com' with the URL you want to check
// The second argument (3) is the number of runs
checkPageView("https://www.rihappy.com.br/boneca-barbie-color-reveal-galaxia-arcoiris-surpresa-mattel/p", 3);
