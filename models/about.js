const aboutSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: String
});

export const About = mongoose.model('About', aboutSchema);