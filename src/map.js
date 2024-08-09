mapboxgl.accessToken = 'pk.eyJ1Ijoicm9jaG90ZSIsImEiOiJjbHRrYmY0Z3EwcTV4Mmlxd2o0OW90Ymo4In0.QSmkyWVFeeRbn8Np6Om-UA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rochote/cltq7r14600xl01nrbf6kccpo', 
    center: [2.174355796080293, 41.403654013280715],
    zoom: 15.5,
    pitch: 45,
    bearing: -17.6,
    antialias: true,
    interactive: true
});

// Add Mapbox Geocoder
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
});

map.addControl(geocoder);

var chapters = {};
var activeChapterName = '';
var introComplete = false; // Flag to check if intro is complete

map.on('load', function() {
    var layers = map.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }

    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "height"]
            ],
            'fill-extrusion-base': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "min_height"]
            ],
            'fill-extrusion-opacity': .6
        }
    }, labelLayerId);

    // Fetch chapters data
    fetch('data/points-of-interest.json')
        .then(response => response.json())
        .then(data => {
            chapters = data;
            // Animate the intro view
            animateIntro();
        })
        .catch(error => console.error('Error loading chapters:', error));
});

function animateIntro() {
    const intro = chapters['intro'];
    if (intro) {
        map.flyTo({
            center: intro.center,
            zoom: intro.zoom,
            pitch: intro.pitch,
            bearing: intro.bearing,
            duration: intro.duration
        });
        setTimeout(() => {
            introComplete = true;
            setActiveChapter('fenicia');
        }, intro.duration);
    }
}

function goToChapter(chapterId) {
    const chapter = chapters[chapterId];
    if (chapter) {
        map.flyTo({
            center: chapter.center,
            zoom: chapter.zoom,
            pitch: chapter.pitch || 0,
            bearing: chapter.bearing || 0,
            duration: chapter.duration || 3000
        });
    }
}

function setActiveChapter(chapterName) {
    if (chapterName === activeChapterName) return;

    goToChapter(chapterName);
    activeChapterName = chapterName;

    document.querySelectorAll('.section').forEach(function(chapter) {
        chapter.classList.remove('active');
    });
    document.getElementById(chapterName).classList.add('active');

    updateNavigationDots(chapterName);
}

function checkChapterInView() {
    const chapterNames = Object.keys(chapters).filter(name => name !== 'intro');
    chapterNames.forEach(function(chapterName) {
        const chapterElement = document.getElementById(chapterName);
        const rect = chapterElement.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            setActiveChapter(chapterName);
        }
    });
}

window.addEventListener('scroll', function() {
    if (!introComplete) {
        introComplete = true; // Ensure intro is marked as complete
        setActiveChapter('fenicia'); // Go directly to the first chapter
    } else {
        checkChapterInView();
    }
});

document.getElementById('fenicia-button').addEventListener('click', () => {
    if (!introComplete) {
        introComplete = true; // Ensure intro is marked as complete
    }
    setActiveChapter('fenicia');
});
document.getElementById('rincon-persa-button').addEventListener('click', () => {
    if (!introComplete) {
        introComplete = true; // Ensure intro is marked as complete
    }
    setActiveChapter('rincon-persa');
});
document.getElementById('cafe-arabia-button').addEventListener('click', () => {
    if (!introComplete) {
        introComplete = true; // Ensure intro is marked as complete
    }
    setActiveChapter('cafe-arabia');
});
// Add more event listeners for other chapters

map.on('click', (event) => {
    const features = map.queryRenderedFeatures(event.point, {
        layers: ['kebab-places-3-6gintv'] 
    });
    if (!features.length) {
        return;
    }
    const feature = features[0];
    
    const link = feature.properties.link && feature.properties.link.includes('http') 
        ? feature.properties.link 
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(feature.properties.title)}`;
    
    const descriptionWithoutLink = feature.properties.description.replace(/, Link:.*/, '');
    const descriptionParts = descriptionWithoutLink.split(',');
    const descriptionText = descriptionParts.slice(0, 3).join('<br>');

    const averageRatingRegex = /Last Year's Average Rating: (\d+\.\d+)/;
    const averageRatingMatch = descriptionWithoutLink.match(averageRatingRegex);
    let roundedAverageRating = averageRatingMatch ? parseFloat(averageRatingMatch[1]).toFixed(2) : 'N/A';

    const descriptionHTML = descriptionText.replace('Ranking:', '<strong>Ranking:</strong>')
      .replace(averageRatingRegex, `<strong>Last Year's Average Rating:</strong> ${roundedAverageRating}`)
      .replace('Last Year\'s Review Count:', '<strong>Last Year\'s Review Count:</strong>');

    const emotionsRegex = /Top 3 emotions: (.*?)(, Link:|$)/;
    const emotionsMatch = descriptionWithoutLink.match(emotionsRegex);
    const topEmotions = emotionsMatch ? emotionsMatch[1] : 'Emotions data not available';

    const hyperlinkText = 'View on Google Maps';
    const hyperlink = `<a href="${link}" target="_blank" style="color: #007cbf;">${hyperlinkText}</a>`;

    const popupContent = `<h3>${feature.properties.title}</h3><p>${descriptionHTML}</p><p><strong>Top 3 emotions:</strong> ${topEmotions}</p>${hyperlink}`;

    const popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(popupContent)
      .addTo(map);
});

function updateNavigationDots(chapterName) {
    var navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function(navItem) {
        navItem.classList.remove('w--current');
    });
    var activeNavItem = document.querySelector(`a[href="#${chapterName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('w--current');
    }
}
