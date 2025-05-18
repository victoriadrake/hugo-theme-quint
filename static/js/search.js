function displayResults(results, store) {
    const searchResults = document.getElementById('results');
    if (!searchResults) {
        console.error('Search results container is missing in the DOM');
        return;
    }
    if (results.length) {
        let resultList = ''
        // Iterate and build result list elements
        for (const n in results) {
            const item = store[results[n].ref]
            resultList += '<div class="card"><a href="' + item.url + '">'
            
            // Add image to search results
            if (item.image) {
                // Use the image parameter if available
                let imgSrc = item.image;
                // Extract the post path from the URL
                const postPath = item.url.substring(0, item.url.lastIndexOf('/') + 1);
                
                // Ensure the image URL is absolute
                if (imgSrc.startsWith('http') || imgSrc.startsWith('/')) {
                    // If it's already an absolute URL, use it as is
                    resultList += '<img src="' + imgSrc + '" alt="' + item.title + '">'
                } else {
                    // If it's a relative URL, prepend the post path
                    resultList += '<img src="' + postPath + imgSrc + '" alt="' + item.title + '">'
                }
            } else {
                // Try to find the first image in the content
                const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/i;
                const imgMatch = imgRegex.exec(item.content);
                
                if (imgMatch && imgMatch[1]) {
                    // Use the first image found in the content
                    let imgSrc = imgMatch[1];
                    // Extract the post path from the URL
                    const postPath = item.url.substring(0, item.url.lastIndexOf('/') + 1);
                    
                    // Ensure the image URL is absolute
                    if (imgSrc.startsWith('http') || imgSrc.startsWith('/')) {
                        // If it's already an absolute URL, use it as is
                        resultList += '<img src="' + imgSrc + '" alt="' + item.title + '">'
                    } else {
                        // If it's a relative URL, prepend the post path
                        resultList += '<img src="' + postPath + imgSrc + '" alt="' + item.title + '">'
                    }
                } else {
                    // Generate random image if no specific image is available
                    // Use a fixed number of random images (10) from the theme's static directory
                    const randomNumber = Math.floor(Math.random() * 10) + 1
                    resultList += '<img src="/images/' + randomNumber + '.jpg" alt="' + item.title + '">'
                }
            }
            
            resultList += '<div class="text"><h2>' + item.title + '</h2>'
            resultList += '<p class="small">' + (item.description || item.content.substring(0, 150) + '...') + '</p>'
            
            // Add metadata (tags, reading time)
            resultList += '<p class="metadata small">'
            if (item.tags && item.tags.length > 0) {
                resultList += '<a class="p-category tag button" href="/tags/' + item.tags[0].toLowerCase() + '/">' + item.tags[0].toLowerCase() + '</a>'
            }
            // Estimate reading time (rough approximation)
            const wordCount = item.content.split(/\s+/).length;
            const readingTime = Math.max(1, Math.round(wordCount / 200)); // Assuming 200 words per minute
            resultList += '&nbsp;' + readingTime + ' min read'
            resultList += '</p></div></a></div>'
        }
        searchResults.innerHTML = resultList
    } else {
        searchResults.innerHTML = 'No results found.'
    }
}

// Get the query parameter(s)
const params = new URLSearchParams(window.location.search)
const query = params.get('query')

// Perform a search if there is a query
if (query) {
    // Retain the search input in the form when displaying results
    document.getElementById('search-input').setAttribute('value', query)

    const idx = lunr(function () {
        this.ref('id')
        this.field('title', {
            boost: 15
        })
        this.field('tags')
        this.field('content', {
            boost: 10
        })

        for (const key in window.store) {
            this.add({
                id: key,
                title: window.store[key].title,
                tags: window.store[key].category,
                content: window.store[key].content
            })
        }
    })

    // Perform the search
    const results = idx.search(query)
    // Update the list with results
    displayResults(results, window.store)
}
