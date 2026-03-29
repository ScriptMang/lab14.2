import express from 'express'

const router = express.Router()

import Note from '../models/Notes.js'
import { authMiddleware } from '../utils/auth.js'
 
// Apply authMiddleware to all routes in this file
router.use(authMiddleware);
 
// GET /api/notes - Get all notes for the logged-in user
// THIS IS THE ROUTE THAT CURRENTLY HAS THE FLAW
router.get('/', async (req, res) => {
  // This currently finds all notes in the database.
  // It should only find notes owned by the logged in user.
  try {
      const notes = await Note.find({user: {$eq: req.user._id}});
      res.json(notes);
  } catch (err) {
    res.status(500).json(err);
  }
});
 
// POST /api/notes - Create a new note
router.post('/', async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      // The user ID needs to be added here
      user: req.user._id
    });
    console.log("What's inside the note:", note);
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json(err);
  }
});
 
// PUT /api/notes/:id - Update a note
router.put('/:id', async (req, res) => {
  try {
    // This needs an authorization check
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (req.user._id != note.user ){
      return res.status(403).json({message: 'User forbidden from updating this note'})
    }
    
    if (!note) {
      return res.status(404).json({ message: 'No note found with this id!' });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json(err);
  }
});
 
// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (req.user._id != note.user) {
      return res.status(403).json({message: 'User forbidden from updating this note'});
    }
    // This needs an authorization check
    if (!note) {
      return res.status(404).json({ message: 'No note found with this id!' });
    }
    note.deleteOne({_id: req.params.id});
    res.json({ message: 'Note deleted!' });
  } catch (err) {
    res.status(500).json(err);
  }
});
 
export default router