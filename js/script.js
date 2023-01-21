const urls = ['tech-1.json', 'tech-2.json', 'tech-3.json']
 
const hideAllSections = () => {
    const sections = document.getElementsByClassName('section')

    Array.prototype.forEach.call(sections, (section) => {
        section.classList.add('hidden')
    })
}

const showSection = (id) => {
    const section = document.getElementById(id)
    section.classList.remove('hidden')
}

const setNavbarEventListeners = () => {
    const btnMain = document.getElementById('btn-main')
    const btnInfo = document.getElementById('btn-info')
    const btnFull = document.getElementById('btn-full')
    
    btnMain.addEventListener('click', () => {
        btnMain.classList.add('active')
        btnInfo.classList.remove('active')
        btnFull.classList.remove('active')

        hideAllSections()
        showSection('main')
    })

    btnInfo.addEventListener('click', () => {
        btnInfo.classList.add('active')
        btnMain.classList.remove('active')
        btnFull.classList.remove('active')

        hideAllSections()
        showSection('info')
    })

    btnFull.addEventListener('click', () => {
        btnFull.classList.add('active')
        btnInfo.classList.remove('active')
        btnMain.classList.remove('active')

        hideAllSections()
        showSection('full')
    })
}

const getData = async (fileName) => {
    let data = await fetch(`https://api.github.com/repos/bilovetskyi/EDI/contents/api/${fileName}?ref=main`)
        .then (d => d.json ())
        .then (d =>
            fetch (
                `https://api.github.com/repos/bilovetskyi/EDI/git/blobs/${d.sha}`
            )
        )
        .then (d => d.json ())
        .then (d => JSON.parse (atob (d.content)));
    
    const table = document.getElementsByClassName('table')[0]
    table.innerHTML = ''

    data.forEach(item => {
        let newElement = document.createElement('div')
        newElement.innerHTML = `
            <div class="card">
                <div class="row">
                    <div class="title">Name: </div>
                    <div class="value">${item.name}</div>
                </div>

                <div class="row">
                    <div class="title">Number: </div>
                    <div class="value">${item.number}</div>
                </div>

                ${item.postal_code_of_delivery
                    ? `
                        <div class="row">
                            <div class="title">Postal code: </div>
                            <div class="value">${item.postal_code_of_delivery}</div>
                        </div>
                    `
                    : ``
                }

                <div class="row">
                    <div class="title">Delivery opportunity: </div>
                    <div class="value">${item.delivery_opportunity}</div>
                </div>

                <div class="row">
                    <div class="title">Price: </div>
                    <div class="value">${item.price}</div>
                </div>
            </div>
        `

        table.appendChild(newElement)
    });

    setCharts(data)
}

const countTypes = (data) => {
    let items = [
        {label: 'Coffee maker', count: 0},
        {label: 'Blender', count: 0},
        {label: 'Toaster', count: 0},
        {label: 'Microwave', count: 0},
        {label: 'Rice cooke', count: 0},
        {label: 'Kettle', count: 0},
        {label: 'Water purifier', count: 0},
        {label: 'Oven', count: 0},
        {label: 'Dishwasher', count: 0},
        {label: 'Refrigerator', count: 0},
    ]

    let labels = []
    let counts = []
    let countDelivery = {available: 0, notAvailable: 0}

    $.each(data, (key, value) => {
        items.forEach(item => {
            item.label === value.name ? item.count = item.count + 1 : item.count = item.count
        })

        value.delivery_opportunity === 'Delivery:Yes'
            ? countDelivery.available = countDelivery.available + 1
            : countDelivery.notAvailable = countDelivery.notAvailable + 1
    })

    items.forEach(item => {
        labels.push(item.label)
        counts.push(item.count)
    })

    return [labels, counts, countDelivery]
}

const setCharts = (data) => {
    const wrapperProducts = document.getElementById('productsChartWrapper');
    const wrapperDelivery = document.getElementById('deliveryChartWrapper');

    wrapperProducts.innerHTML = ''
    wrapperDelivery.innerHTML = ''

    const ctxProducts = document.createElement('canvas')
    const ctxDelivery = document.createElement('canvas')

    wrapperProducts.appendChild(ctxProducts)
    wrapperDelivery.appendChild(ctxDelivery)

    const [labels, counts, countDelivery] = countTypes(data)

    new Chart(ctxProducts, {
        type: 'bar',
        data: {
        labels: labels,
        datasets: [{
            label: 'Number of products',
            data: counts,
            borderWidth: 1
        }]
        },
        options: {
        scales: {
            y: {
            beginAtZero: true
            }
        }
        }
    });

    new Chart(ctxDelivery, {
        type: 'doughnut',
        data: {
        labels: ['Delivery available', 'Delivery not available'],
        datasets: [{
            label: 'Number of products',
            data: [countDelivery.available, countDelivery.notAvailable],
            borderWidth: 1
        }]
        },
        options: {

        }
    });
}

const setDataEventListeners = () => {
    urls.forEach((url, index) => {
        $(`#btn-dataset-${index + 1}`).get(0)
        .addEventListener('click', (e) => {
            getData(urls[index])
        })
    })
}

const init = () => {
    hideAllSections()
    showSection('main')
    getData('tech-1.json')
    setNavbarEventListeners()
    setDataEventListeners()
}

init()