const Note = require('../models/Note');

// @desc    Get all notes for user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        const { topic, tag } = req.query;

        let query = { userId: req.user._id };

        if (topic) query.topic = topic;
        if (tag) query.tags = { $in: [tag] };

        const notes = await Note.find(query).sort({ updatedAt: -1 });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note && note.userId.toString() === req.user._id.toString()) {
            res.json(note);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    try {
        const { topic, title, content, codeTemplates, tags } = req.body;

        const note = await Note.create({
            userId: req.user._id,
            topic,
            title,
            content,
            codeTemplates,
            tags,
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note && note.userId.toString() === req.user._id.toString()) {
            note.topic = req.body.topic || note.topic;
            note.title = req.body.title || note.title;
            note.content = req.body.content !== undefined ? req.body.content : note.content;
            note.codeTemplates = req.body.codeTemplates !== undefined ? req.body.codeTemplates : note.codeTemplates;
            note.tags = req.body.tags || note.tags;
            note.updatedAt = Date.now();

            const updatedNote = await note.save();
            res.json(updatedNote);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note && note.userId.toString() === req.user._id.toString()) {
            await note.deleteOne();
            res.json({ message: 'Note removed' });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
};
