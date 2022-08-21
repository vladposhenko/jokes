const categories = document.getElementById("btnGroup")
const form = document.getElementById("jokesForm")
const searchInput = document.getElementById('searchInput')
const jokes = document.querySelector(".jokes__list")
const favJokes = document.getElementById('favJokes')

// Запрос по категориям + вывод категорий в HTML
fetch('https://api.chucknorris.io/jokes/categories')
    .then(response => response.json())
    .then(data => {
        let list =  data.map((category, i) => `<li class="form_radio_btn">
        <input id=${`radio` + i} type="radio" name="jokesCategory" value=${category} >
        <label for=${`radio` + i}>${category}</label>
    </li>`).join("")
        categories.innerHTML = list
})


// Отслеживание изменений формы для динамического появления инпута и категорий
form.addEventListener('change', (e) => {
    const checked = document.querySelector('input[name=jokesField]:checked').value
    if(checked === 'categories') {
        categories.style.display = 'flex'
        searchInput.style.display = 'none'
    } else if (checked === 'search') {
        categories.style.display = 'none'
        searchInput.style.display = 'flex'
    } else {
        categories.style.display = 'none'
        searchInput.style.display = 'none'
    }
})


function createElements () {

}

// Функция которая создает новые карточки и вставляет их в контейнер
function createCard (data, container) {
    const card = document.createElement('div')
    const jokesText = document.createElement('p')
    const heart = document.createElement('img')
    const message = document.createElement('img')
    const id = document.createElement('a')

    const update = document.createElement('p')
    update.innerText = ` Last update: ${data.updated_at.split(" ")[0]}`
    update.classList.add("jokes__update")

    id.innerHTML = data.id;
    id.href = ""
    message.src = 'images/message.png'
    message.classList.add('message__img')
    card.classList.add("jokes__card")
    heart.classList.add("like")

    data.favourite = checkFavListJokes(data.id)
    heart.src = !data.favourite ? 'images/Vector.svg' : 'images/heart.svg'
    jokesText.innerText = data.value
    
    card.append(message)
    card.append(heart)
    card.append(id)
    card.append(jokesText)
    card.append(update)
    container.append(card)

    if(data.categories.length) {
        const category = document.createElement('p')
        category.innerText = data.categories
        category.classList.add("jokes__category")
        card.append(category)
    }

    // Отслеживание клика на сердечко
    heart.addEventListener('click' , (e) => {

        data.favourite = checkFavListJokes(data.id)
        if(data.favourite) {
            removeFromLocalStorage(data.id);
            heart.src = 'images/Vector.svg'
        } else {
            data.favourite = false
            saveFavToStorage(data)
            createCard(data, favJokes)
            heart.src = 'images/heart.svg'
        }
    })
}


// Функция которая рендерит шутку и определяет откуда пришли данные
function renderJoke (data) {
    if(data.result) {
        data.result.forEach((joke) => {
            createCard(joke, jokes)
        })
    } else {
        createCard(data, jokes)
    }
}

// Отслеживание добавления шутки в форме
form.addEventListener('submit', (e) => {
    e.preventDefault()
    const checked = document.querySelector('input[name=jokesField]:checked').value

    let URL = 'https://api.chucknorris.io/jokes/'

    if(checked === 'search') {
        const search = document.getElementById('searchInput').value
        URL += `search?query=${search}`
    } else if (checked === 'categories') {
        URL += `random?category=${document.querySelector('input[name=jokesCategory]:checked').value}`
    } else if (checked === 'random') {
        URL += 'random'
    }

    fetch(URL) 
        .then(response => response.json())
        .then(data => {
            console.log(data);
            renderJoke(data)
        })
})


// Функция которая сохраняет выбраные шутки в список "favourite"
function saveFavToStorage (joke) {
    let parse = isJokesInLocalStorage ()
    if(parse){
        parse.push(joke)
        const strJoke = JSON.stringify(parse)
        localStorage.setItem("favourite", strJoke)
    } else {
        const arrJoke = JSON.stringify([joke])
        localStorage.setItem("favourite", arrJoke)
    }
}


// Функция которая проверяет есть ли шутки в localstorage и если есть возвращает их
function isJokesInLocalStorage () {
    if(localStorage.getItem("favourite")){;
        const parse = JSON.parse(localStorage.getItem("favourite"))
        return parse
    }
    return false
}


function checkFavListJokes (id) {
    let jokes = isJokesInLocalStorage()
    if(jokes){
        return jokes.some((favJoke) => favJoke.id === id)
    }
    return false
}


// Функция которая записывает шутки в localstorage. Вызывается при запуске программы
function renderFavToStorage () {
    let parse = isJokesInLocalStorage ()
    if(parse){
        parse.forEach((card) => {
            createCard(card, favJokes)
        })
    }
}


// Функция которая убирает шутку с localstorage
function removeFromLocalStorage(id) {
    let jokes = isJokesInLocalStorage();
    const filterJokes = jokes.filter(joke => joke.id !== id);

    if(filterJokes.length) {
        localStorage.setItem("favourite", JSON.stringify(filterJokes));
    } else {
        localStorage.setItem("favourite", "");
    }
    favJokes.innerHTML = "";
    renderFavToStorage();
}


renderFavToStorage()