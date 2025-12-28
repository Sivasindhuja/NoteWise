import express from 'express';
import * as noteController from '../controllers/noteController.js';

const router = express.Router();

router.post('/', noteController.createNote);        
router.get('/', noteController.readAllNotes);      
router.delete('/:noteId', noteController.deleteNote);
router.patch('/:noteId', noteController.editNotes); 
export default router;