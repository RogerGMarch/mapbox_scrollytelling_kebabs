window.onscroll = function() {
    var chapterNames = Object.keys(chapters).concat('features').filter(name => name !== 'intro'); // Include 'features' and exclude 'intro'
    for (var i = 0; i < chapterNames.length; i++) {
        var chapterName = chapterNames[i];
        if (isElementOnScreen(chapterName)) {
            setActiveChapter(chapterName);
            break;
        }
    }
};

var activeChapterName = '';

function setActiveChapter(chapterName) {
    if (chapterName === activeChapterName) return;

    if (chapterName !== 'features') {
        map.flyTo(chapters[chapterName]);
    }

    document.querySelectorAll('.section').forEach(function(chapter) {
        chapter.classList.remove('active');
    });
    if (document.getElementById(chapterName)) {
        document.getElementById(chapterName).classList.add('active');
    }

    // Update navigation dots
    updateNavigationDots(chapterName);

    activeChapterName = chapterName;
}

function isElementOnScreen(id) {
    var element = document.getElementById(id);
    var bounds = element.getBoundingClientRect();
    return bounds.top < window.innerHeight && bounds.bottom > 300;
}

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
document.getElementById('features-button').addEventListener('click', () => {
    if (!introComplete) {
        introComplete = true; // Ensure intro is marked as complete
    }
    setActiveChapter('features');
});
