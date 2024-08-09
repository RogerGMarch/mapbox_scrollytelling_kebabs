document.addEventListener('DOMContentLoaded', function() {
    fetch('data/sections.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const featuresDiv = document.getElementById('features');
            if (!featuresDiv) {
                console.error('Features div not found');
                return;
            }

            Object.keys(data).forEach(id => {
                const section = data[id];
                const sectionDiv = document.createElement('div');
                sectionDiv.id = id;
                sectionDiv.className = 'section';

                sectionDiv.innerHTML = `
                    <div class="section__inner-wrap">
                        <h1 class="heading"><span class="number">${("0" + (Object.keys(data).indexOf(id) + 1)).slice(-2)}</span> ${section.title}</h1>
                        <img src="${section.image}" alt="${section.title}" class="section-image"/>
                        <p>${section.content}</p>
                    </div>
                `;
                featuresDiv.appendChild(sectionDiv);
            });
        })
        .catch(error => {
            console.error('Error loading sections:', error);
        });
});
