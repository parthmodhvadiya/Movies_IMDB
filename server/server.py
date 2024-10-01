from flask import Flask, request, jsonify
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])
CORS(app)

pickle_filename = "../model/cosine_similarity_prompt_model.pkl"
# Load the saved model when the app starts
def load_model(pickle_filename):
    with open(pickle_filename, 'rb') as f:
        return pickle.load(f)

tfidf, tfidf_matrix, movies = load_model('../model/cosine_similarity_prompt_model.pkl')

# Recommendation function
def get_recommendations(prompt, num_recommendations=10):
    # Convert the input prompt into a TF-IDF vector
    prompt_tfidf = tfidf.transform([prompt])
    
    # Compute cosine similarity between the input prompt and all movie tags
    cosine_sim_prompt = cosine_similarity(prompt_tfidf, tfidf_matrix)
    
    # Get the similarity scores for all movies and sort by similarity
    sim_scores = sorted(list(enumerate(cosine_sim_prompt[0])), key=lambda x: x[1], reverse=True)
    
    # Get the top 'num_recommendations' similar movies
    sim_scores = sim_scores[:num_recommendations]
    movie_indices = [i[0] for i in sim_scores]
    
    # Return the movie titles of the top 'num_recommendations' similar movies
    recommended_movies = movies['movie_id'].iloc[movie_indices].values
    # return jsonify({"movie_ids": recommended_movies})
    return recommended_movies

# # API route to get movie recommendations based on a prompt
@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.json
        prompt = data.get('prompt')
        num_recommendations = data.get('num_recommendations', 10)  # Default to 10 if not provided
        
        # Get recommendations
        recommendations = get_recommendations(prompt, num_recommendations)
        
        # Return the recommendations as JSON
        return jsonify({'movie_ids': recommendations.tolist()})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# recommend
movies_df = pd.read_csv('../model/data/Movies.csv')  

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        movie_id = data.get('movie_id')
    
        if not movie_id:
            return jsonify({'error': 'No movie_id provided'}), 400
    
    # Get the movie details based on the movie_id
        movie = movies_df[movies_df['movie_id'] == int(movie_id)]
    
        if movie.empty:
            return jsonify({'error': 'Movie not found'}), 404
    
        overview = movie.iloc[0]['tags']
    
    # Get recommendations based on the overview
        recommendations = get_recommendations(overview)
        return jsonify({'movie_ids': recommendations.tolist()})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
if __name__ == '__main__':
    app.run(debug=True)
