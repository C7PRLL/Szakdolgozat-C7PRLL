const express = require('express');
const router = express.Router();
const { Pilot } = require('../models');

// összes pilóta lekérése
router.get('/', async (req, res) => {
    try {
        const pilots = await Pilot.findAll();
        res.json(pilots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// egy pilóta lekérése ID alapján
router.get('/:id', async (req, res) => {
    try {
        const pilot = await Pilot.findByPk(req.params.id);
        if (pilot) {
            res.json(pilot);
        } else {
            res.status(404).json({ message: 'Pilóta nem található' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// úőj pilóta felvétele
router.post('/', async (req, res) => {
    try {
        const { name, nationality, birth_date, gender, is_active } = req.body;
        const newPilot = await Pilot.create({ 
            name, 
            nationality, 
            birth_date, 
            gender, 
            is_active: is_active ?? true 
        });
        res.status(201).json(newPilot);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// pilóta törlése
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Pilot.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.json({ message: "Pilóta sikeresen törölve!" });
        } else {
            res.status(404).json({ message: "Nincs ilyen ID-jű pilóta." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;