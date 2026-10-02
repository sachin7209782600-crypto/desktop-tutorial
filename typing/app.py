from flask import Flask, jsonify, request, send_from_directory
import random
import os

app = Flask(__name__, static_folder='.', static_url_path='')

# Define initial lessons
INITIAL_LESSONS = [
    "A smooth sea never made a skilled sailor.",    # Lesson 1
    "The secret of getting ahead is getting started.", # Lesson 2
    "Do not wait to strike till the iron is hot.",    # Lesson 3
    "Programming is the art of telling a computer what to do.", # Lesson 4
]
-
# Auto-generated lesson topics for variety
LESSON_TOPICS = [
    "Technology makes life easier every single day.",
    "Practice typing to improve your speed and accuracy.",
    "Consistency is key to becoming a better typist.",
    "Great things take time and dedication to achieve.",
    "Learning new skills opens many doors of opportunity.",
    "The early bird catches the worm every morning.",
    "Success comes to those who work hard and never quit.",
    "Innovation drives progress in every field imaginable.",
    "Good communication is essential for teamwork.",
    "Reading books expands your knowledge and creativity.",
    "Exercise daily for a healthy and happy life.",
    "Patience and persistence lead to victory always.",
    "Music soothes the soul and elevates the mood.",
    "Nature provides everything we need to survive.",
    "Time management helps you accomplish your goals.",
    "Friendship is one of the greatest gifts in life.",
    "Education opens doors to unlimited possibilities.",
    "Adventure awaits those brave enough to seek it.",
    "Coffee keeps the world moving forward every day.",
    "Coding requires logical thinking and attention to detail."
]

def generate_lesson(index):
    """Generate a lesson dynamically based on index."""
    if index < len(INITIAL_LESSONS):
        return INITIAL_LESSONS[index]
    else:
        # Use index to cycle through generated topics
        topic_index = (index - len(INITIAL_LESSONS)) % len(LESSON_TOPICS)
        return LESSON_TOPICS[topic_index]

# --- SERVE HTML PAGE ---
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# --- API Endpoint to Fetch New Text/Lesson ---
@app.route('/api/get-text', methods=['GET'])
def get_new_text():
    """Returns the next text snippet based on the current lesson index."""
    
    # Get the index from the JavaScript request's URL
    current_index = request.args.get('index', default=0, type=int)
    
    # Generate lesson (auto-generates if beyond initial lessons)
    lesson_text = generate_lesson(current_index)
    
    return jsonify({
        'text': lesson_text, 
        'lesson_number': current_index + 1,
        'finished': False
    })


# (Keep the existing /api/save-score endpoint here if you are using it)

if __name__ == '__main__':
    app.run(debug=True)