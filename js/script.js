const urls = ['tech-1.json', 'tech-2.json', 'tech-3.json']

let productsChart
let deliveryChart
 
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
        newElement.classList.add('card')
        newElement.innerHTML = `
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
        `

        table.appendChild(newElement)
    });

    setCharts(data)
}

const countTypes = (data) => {
    let items = []
    let labels = []

    data.forEach(item => labels.push(item.name))

    labels = [...new Set(labels)]

    labels.forEach(label => items.push({label: label, count: 0}))

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
        counts.push(item.count)
    })

    return [labels, counts, countDelivery]
}

const setCharts = (data) => {
    $("#productsChart").remove()
    $("#deliveryChart").remove()

    const [labels, counts, countDelivery] = countTypes(data)

    $("#productsChartWrapper").append('<canvas id="productsChart"></canvas>')
    $("#deliveryChartWrapper").append('<canvas id="deliveryChart"></canvas>')

    const ctxProducts = document.querySelector('#productsChart')
    const ctxDelivery = document.querySelector('#deliveryChart')

    productsChart = new Chart(ctxProducts, {
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
    })

    deliveryChart = new Chart(ctxDelivery, {
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
            maintainAspectRatio: false
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