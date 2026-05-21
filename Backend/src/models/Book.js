import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true,
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true,
    },
    isbn: {
        type: String,
        required: [true, 'ISBN is required'],
        unique: true,
        trim: true,
        index: true,
    },
    genre: {
        type: String,
        required: [true, 'Genre is required'],
        trim: true,
    },
    totalCopies: {
        type: Number,
        required: [true, 'Total copies count is required'],
        min: [0, 'Total copies cannot be negative'],
    },
    availableCopies: {
        type: Number,
        min: [0, 'Available copies cannot be negative'],
    },
    shelfLocation: {
        type: String,
        required: [true, 'Shelf location is required'],
        trim: true,
    },
    image: {
        type: String, // upload path
        default: '',
    },
    publishedYear: {
        type: Number,
        required: [true, 'Published year is required'],
    }
}, {
    timestamps: true
});

// Set availableCopies equal to totalCopies on new book creation
bookSchema.pre('save', function() {
    if (this.isNew && this.availableCopies === undefined) {
        this.availableCopies = this.totalCopies;
    }
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
