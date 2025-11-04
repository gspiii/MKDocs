// search-worker.js for MkDocs search plugin

"use strict";

// Load lunr.js library (assuming it's loaded globally or via importScripts in a real worker context)
// In this context, we might need to ensure lunr is available.
// If running directly in browser without worker, lunr should be loaded first.
// If using a real Worker, use: importScripts('lunr.min.js');

var lunrIndex, searchData;
var isLunrInitialized = false;

// Initialize lunr index
function initLunr() {
    if (isLunrInitialized || typeof lunr === 'undefined') {
        // Avoid re-initialization or if lunr is not loaded
        return;
    }
    try {
        // Load the prebuilt index if available
        if (searchData && searchData.index) {
            lunrIndex = lunr.Index.load(searchData.index);
            isLunrInitialized = true;
            console.log("Search worker: Lunr index loaded from prebuilt data.");
        }
        // Otherwise, build the index from documents
        else if (searchData && searchData.docs) {
            lunrIndex = lunr(function () {
                // Use pipeline and fields defined in the searchData config if available
                if (searchData.config && searchData.config.pipeline) {
                    this.pipeline.remove(lunr.stemmer);
                    searchData.config.pipeline.forEach(function (pipe) {
                       if (lunr.Pipeline.registeredFunctions[pipe]) {
                            this.pipeline.add(lunr.Pipeline.registeredFunctions[pipe]);
                       } else {
                            console.warn("Search worker: Unknown pipeline function:", pipe);
                       }
                    }, this);
                    // Assume default search pipeline needs similar adjustment if specified
                    this.searchPipeline.remove(lunr.stemmer);
                     searchData.config.pipeline.forEach(function (pipe) {
                       if (lunr.Pipeline.registeredFunctions[pipe]) {
                            this.searchPipeline.add(lunr.Pipeline.registeredFunctions[pipe]);
                       }
                    }, this);
                } else {
                     // Default setup if config is missing
                     this.pipeline.remove(lunr.stemmer);
                     this.searchPipeline.remove(lunr.stemmer);
                }

                // Use fields defined in the config or default to location, title, text
                 const fields = (searchData.config && searchData.config.fields) ? searchData.config.fields : ['location', 'title', 'text'];
                 fields.forEach(function (field) { this.field(field); }, this);

                this.ref('location'); // Use 'location' (URL) as the reference

                searchData.docs.forEach(function (doc) {
                    // Ensure all expected fields exist, even if empty
                    const docToAdd = {};
                     fields.forEach(function(field) {
                        docToAdd[field] = doc[field] || "";
                     });
                     docToAdd['location'] = doc['location']; // Ensure ref field is present

                    this.add(docToAdd);
                }, this);
            });
            isLunrInitialized = true;
             console.log("Search worker: Lunr index built from docs.");
        } else {
             console.error("Search worker: No search data provided or data is invalid.");
             return; // Exit if no data
        }
         // Signal that the index is ready
         self.postMessage({ type: 'index_ready' });

    } catch (e) {
        console.error("Search worker: Error initializing lunr:", e);
    }
}

// Perform search
function search(query) {
    if (!isLunrInitialized) {
        console.warn("Search worker: Search called before index was ready.");
        // Optionally try to initialize now, though it might be too late
        // initLunr();
        // if (!isLunrInitialized) return { results: [] }; // Return empty if still not ready
         return { results: [], query: query }; // Indicate failure or empty results
    }
    try {
        const results = lunrIndex.search(query).map(function(result) {
            // Find the original document data corresponding to the result reference (URL)
            const doc = searchData.docs.find(doc => doc.location === result.ref);
            return {
                location: result.ref,
                title: doc ? doc.title : result.ref, // Fallback to location if doc not found
                score: result.score,
                // Optionally add context/preview if needed (requires more processing)
                // text: doc ? doc.text.substring(0, 150) + '...' : ''
            };
        });
         // console.log("Search worker: Found results:", results.length);
         return { results: results, query: query };
    } catch (e) {
        console.error("Search worker: Error during search:", e);
        return { results: [], query: query }; // Return empty on error
    }
}

// Message handler for the worker
self.onmessage = function(event) {
    // console.log("Search worker received message:", event.data.type);
    switch (event.data.type) {
        case 'load':
            searchData = event.data.data;
            initLunr(); // Initialize lunr with the loaded data
            break;
        case 'search':
            if (!event.data.query) {
                 // If query is empty, send empty results immediately
                 self.postMessage({ type: 'results', results: [], query: '' });
                 break;
            }
            const searchResults = search(event.data.query);
            self.postMessage({ type: 'results', results: searchResults.results, query: event.data.query });
            break;
        default:
            console.error("Search worker: Unknown message type:", event.data.type);
    }
};

// Initial setup: Send message indicating the worker is ready (but index isn't necessarily)
// The main script should wait for 'index_ready' before enabling search input.
self.postMessage({ type: 'worker_ready' });
console.log("Search worker: Ready and waiting for data.");
