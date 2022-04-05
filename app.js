const express = require('express')
const app = express()
const fs = require('fs')

let database = []

fs.readFile('./data/database.json', (err, data) => {
	if (!err) {
		database = JSON.parse(data)
	}
})

const parser = require('body-parser')
app.use(parser.urlencoded({extended: true}))

app.use('/assets', express.static('./public'))

app.set('view engine', 'pug')

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/notes/create', (req, res) => {
	res.render('create', {show: req.query.success})
})

function generateRandomId() {
	return Math.floor(Math.random() * 99999999999) + 1;
}

app.post('/notes/create', (req, res) => {

	if (req.body.title.trim() == '' || req.body.details.trim() == '') {
        res.render(`/notes/create`, { error: true })

    } else {
		// get the sent data
		const note = {
			id: generateRandomId(),
			title: req.body.title,
			body: req.body.details,
			favorite: false
		}

		// store it somewhere
		database.push(note)
		fs.writeFile('./data/database.json', JSON.stringify(database), (err) => {
			if (err) {
				res.redirect('/notes/create?success=0')
			} else {
				res.redirect('/notes/create?success=1')
			}
		})
	}

	// redirect user back
	
})

app.get('/notes', (req, res) => {
	res.render('notes', {notes: database})
})

app.get('/notes/:id', (req, res) => {
	const id = parseInt(req.params.id)
	const note = database.find(note => note.id === id)

	res.render('note', {note: note})
})

app.get('/notes/:id/delete', (req, res) => {
	const id = parseInt(req.params.id)
	const index = database.findIndex(note => note.id === id)

	// Delete from notesDB array
	database.splice(index, 1)

	// Update database.json file
	fs.writeFile('./data/database.json', JSON.stringify(database), (err) => {
		if (err) {
			res.redirect('/notes?success=0')
		} else {
			res.redirect('/notes?success=1')
		}
	})
})

app.get('/notes/:id/update', (req, res) => {
	const id = parseInt(req.params.id)
	const note = database.find(note => note.id === id)

    res.render('update', {note: note, show: req.query.success})
})

app.post('/notes/:id/update', (req,res) => {
    const id = parseInt(req.params.id)
	const index = database.findIndex(note => note.id === id)

	if (req.body.title.trim() == '' || req.body.details.trim() == '') {
		res.render(`/notes/${ id }/update`, { error: true })
	
	} else {
        database[index].title = req.body.title
        database[index].body = req.body.details

        fs.writeFile('./data/database.json', JSON.stringify(database), (err) => {
            if (err) {
                res.redirect(`/notes/${ id }/update?success=0`)
            } 
            else {
                res.redirect(`/notes/${ id }/update?success=1`)
            }
        })
    }
})

app.get('/notes/:id/favorite', (req, res) => {
	const id = parseInt(req.params.id)
	const index = database.findIndex(note => note.id === id)


	database[index].favorite = true

	fs.writeFile('./data/database.json', JSON.stringify(database), (err) => {
		if (err) {
			res.redirect('/notes?success=0')
		} else {
			res.redirect('/notes?success=1')
		}
	})
})

app.get('/notes/:id/unfavorite', (req, res) => {
	const id = parseInt(req.params.id)
	const index = database.findIndex(note => note.id === id)


	database[index].favorite = false

	fs.writeFile('./data/database.json', JSON.stringify(database), (err) => {
		if (err) {
			res.redirect('/notes?success=0')
		} else {
			res.redirect('/notes?success=1')
		}
	})
})

app.get('/favorite', (req, res) => {
	const notes = database.filter(note => note.favorite)

	res.render('favorite', {notes: notes})
})

app.listen(3000, () => console.log('App Port: 3000'))
