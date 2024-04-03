const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Mohon maaf browser anda tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        books.length = 0;
        for (const book of data) {
            books.push(book);
        }
    }
    applySearchFilter();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBooks() {
    applySearchFilter();
}

function applySearchFilter() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchInput) ||
        book.author.toLowerCase().includes(searchInput) ||
        book.year.toLowerCase().includes(searchInput)
    );

    const uncompletedBookList = document.getElementById('books');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('complete-books');
    completedBookList.innerHTML = '';

    for (const bookItem of filteredBooks) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            uncompletedBookList.append(bookElement);
        } else {
            completedBookList.append(bookElement);
        }
    }
}

document.addEventListener('DOMContentLoaded', function (){
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', function () {
        searchBooks();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function addBook(){
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, title, author, year, false);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener(RENDER_EVENT, function() {
    const uncompletedBookList = document.getElementById('books');
    uncompletedBookList.innerHTML = '';
    
    const completedBookList = document.getElementById('complete-books');
    completedBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            uncompletedBookList.append(bookElement);
        } else {
            completedBookList.append(bookElement)
        }
    }
});

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = "Penulis: " + bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = "Tahun: " + bookObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('div');
    container.classList.add('item');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);
    
    if (bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', function () {
            undoBook(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function () {
            confirmDeleteBook(bookObject.id);
        });

        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');

        checkButton.addEventListener('click', function () {
            addBookToUncomplete(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function () {
            confirmDeleteBook(bookObject.id);
        })

        container.append(checkButton, trashButton);
    }

    return container;
}

function addBookToUncomplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) {
        return;
    };

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function confirmDeleteBook(bookId) {
    const confirmDelete = confirm('Apakah Anda yakin ingin menghapus data buku ini?');
    
    if (confirmDelete) {
        removeBook(bookId);
    }
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) {
        return;
    }

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


function undoBook(bookId){
    const bookTarget = findBook(bookId);

    if (bookTarget == null) {
        return;
    }

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex (bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}