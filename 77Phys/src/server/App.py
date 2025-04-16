from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from statistics import mean
from sqlalchemy import delete


from flask_jwt_extended import JWTManager, create_access_token, decode_token
import os

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get('SQLALCHEMY_DATABASE_URI')  or "postgresql://benjman:0624@localhost/77physique"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = '0624'

port = os.environ.get("PORT", 8000)
CORS(app, supports_credentials=True)

db= SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
expiration = datetime.now(timezone.utc) + timedelta(hours=140)




class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = {"schema": "77physique"}
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100),  nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    comments = db.relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    workouts = db.relationship("Workout", back_populates="user")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
class Blog(db.Model):
    __tablename__ = 'blog'
    __table_args__ = {"schema": "77physique"}
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    body_id = db.Column(db.Integer, db.ForeignKey('77physique.blog_body.id'), nullable=False)

    body = db.relationship("BlogBody", back_populates="blog", uselist=False)
    user = db.relationship("User")
    user_id = db.Column(db.Integer, db.ForeignKey("77physique.users.id"), nullable=False)
    comments = db.relationship("Comment", back_populates="blog", cascade="all, delete-orphan")
    def serialize(self):
        return{
            "id": self.id,
            "title": self.title,
            "date": self.date.strftime("%Y-%m-%d"),
            "author": self.user.username,
            'body': self.body.body,
        }
class BlogBody(db.Model):
    __tablename__ = 'blog_body'
    __table_args__ = {"schema": "77physique"}
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String, nullable=False)

    blog = db.relationship("Blog", back_populates="body", uselist=False)

class Workout(db.Model):
    __tablename__ = 'workout'
    __table_args__ = {"schema": "77physique"}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("77physique.users.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)

    exercises = db.relationship("Exercise", back_populates="workout")
    user = db.relationship("User", back_populates="workouts")

class Exercise(db.Model):
    __tablename__ = 'exercise'
    __table_args__ = {"schema": "77physique"}

    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(db.Integer, db.ForeignKey("77physique.workout.id"), nullable=False)  # Corrected FK
    name = db.Column(db.String(50), nullable=False)
    sets = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Integer, nullable=False)

    workout = db.relationship("Workout", back_populates="exercises") 

class Comment(db.Model):
    __tablename__ = "comment"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    blog_id = db.Column(db.Integer, db.ForeignKey("77physique.blog.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("77physique.users.id"), nullable=True)

    blog = db.relationship("Blog", back_populates="comments")
    user = db.relationship("User", back_populates="comments")


class favBlog(db.Model):
    __tablename__ = 'fav_blog'
    __table_args__ = {"schema": "77physique"}
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("77physique.users.id"), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey("77physique.blog.id"), nullable=False)

    user = db.relationship("User", backref="favorites")
    blog = db.relationship("Blog", backref="favorited_by")



  






    
with app.app_context():
    db.create_all()

def get_user(request):
    token = request.cookies.get('access_token')
    decoded_token = decode_token(token)
    user = User.query.get(int(decoded_token['sub']))
    if not user:
        return None
    return user



@app.route('/', methods=["GET"])
def get_user_data():
    try:
        users= User.query.all()
        user_data = {"username": "Tony Tony Chopper", "email": "goingSunny@gmail.com"}
        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching data', 'error': str(e)}), 500


# USER PATHS
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    if not data or not all(k in data for k in ["username", "email", "password"]):
        return jsonify({"message": "Missing required fields"}), 400
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"message": "Username already exits"}), 400
    
    new_user = User(username=data["username"], email=data["email"])
    new_user.set_password(data["password"])

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Signup successful"}), 201

@app.route("/logout", methods=["POST"])
def logout():
    token = request.cookies.get("access_token")
    if not token:
        return jsonify({"error": "User not logged in"}), 401

    response = make_response(jsonify({"message": "Logged out successfully"}))
    response.set_cookie(
        "access_token",
        "",
        path="/",
        httponly=True,
        secure=True,
        samesite="None",
        expires=0
    )
    return response
@app.route("/login", methods=["POST"])
def login():
    data = request.json


    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401




    response = make_response(jsonify({"message": "Login successful"}))
    token = create_access_token(identity=str(user.id))
    print(token)
    response.set_cookie(
        'access_token',
        token,
        path='/',
        httponly=True,
        secure=True,
        samesite='None',
        expires=expiration
    )

    return response



@app.route("/user/<string:username>", methods=["GET"])
def user(username):
    user = get_user(request)
    if user is None:
            return jsonify({'error':'user not found'}),404
    return jsonify({
        "id": user.id,
        "username": user.username,
    }),200
# 

# BLOG PATHS

@app.route("/my-blogs", methods=["GET"])
def grabMyBlogs():
    user = get_user(request)

    if not user:
        return jsonify({"error": "Not authorized"}), 401
    
    print(f"Fetching blogs for user_id: {user.id}")
    try:
        blogs = Blog.query.filter_by(user_id=user.id).order_by(Blog.date.desc()).all()
        blog_list =[]
        for blog in blogs:
            blog_list.append({
                "id": blog.id,
                "title": blog.title,
                "date": blog.date.strftime('%Y-%m-%d'),
                "body": blog.body.body
            })
        return jsonify(blog_list)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error":"Could not fetch blogs"}), 500
    
@app.route("/delete-blog/<int:blog_id>", methods=["DELETE"])
def delete_blog(blog_id):
    user = get_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        blog = Blog.query.filter_by(id=blog_id, user_id=user.id).first()
        if not blog:
            return jsonify({"error": "Blog not found"}), 404

        db.session.delete(blog)
        db.session.commit()

        return jsonify({"message": "Blog deleted successfully"}), 200

    except Exception as e:
        print(f"Delete error: {e}")
        return jsonify({"error": "Failed to delete blog"}), 500

@app.route("/submitBlog", methods=["POST"])
def create_blog():
    data = request.json

    user = get_user(request)
    print(user)

    if not user:
        return jsonify({"error": "Not allowed"}), 401

    
    try:
        blog_date = datetime.strptime(data['date'], "%Y-%m-%d")

        new_body = BlogBody(body=data['blogBody'])
        db.session.add(new_body)
        db.session.commit()

        new_blog = Blog(
            title = data['title'],
            date=blog_date,
            user_id=user.id,
            body_id=new_body.id
        )
        db.session.add(new_blog)
        db.session.commit()


        return jsonify({"message": "Blog post created successfully"}), 201
    except Exception as e: 
        raise(e)
    
@app.route("/blogs", methods=["GET"])
def list_blogs():
    blogs = Blog.query.all()

    serialized =  [blog.serialize() for blog in blogs]

    return jsonify(serialized), 200

@app.route("/blogs/<id>", methods=["GET"])
def grab_blog(id):
    blog = Blog.query.get_or_404(id)
    return jsonify(blog.serialize())

from flask import request, jsonify

@app.route("/fav-blog", methods=["POST"])
def favorite_blog():
    user = get_user(request)
    if not user:
        return jsonify({"error": "Not Authorized"}), 401

    if not request.is_json:
        return jsonify({"error": "Request content type must be application/json"}), 415

    try:
        data = request.get_json()
        blog_id = data.get("blog_id")

        if not blog_id:
            return jsonify({"error": "No blog_id provided"}), 400

        existing = favBlog.query.filter_by(user_id=user.id, blog_id=blog_id).first()
        if existing:
            return jsonify({"message": "Already Favorited"}), 200

        fav = favBlog(user_id=user.id, blog_id=blog_id)
        db.session.add(fav)
        db.session.commit()

        return jsonify({"message": "Blog Favorited"}), 200

    except Exception as e:
        print("Error in /fav-blog:", e)
        return jsonify({"error": "An error occurred while favoriting the blog"}), 500
    

@app.route("/remove-fav-blog/<int:blog_id>", methods=["DELETE"])
def remove_favorite_blog(blog_id):
    user = get_user(request)
    if not user:
        return jsonify({"error": "Not Authorized"}), 401

    try:
        fav = favBlog.query.filter_by(user_id=user.id, blog_id=blog_id).first()

        if not fav:
            return jsonify({"message": "Blog not in favorites"}), 200

        db.session.delete(fav)
        db.session.commit()

        return jsonify({"message": "Removed from favorites"}), 200

    except Exception as e:
        print("Error in /remove-fav-blog:", e)
        return jsonify({"error": "An error occurred while removing the blog"}), 500


@app.route("/my-blogs", methods=["GET"])
def getMyBlogs():
    user = get_user(request)

    if not user:
        return jsonify({"error": "Not authorized"}), 401
    
    print(f"Fetching blogs for user_id: {user.id}")
    try:
        blogs = Blog.query.filter_by(user_id=user.id).order_by(Blog.date.desc()).all()
        blog_list =[]
        for blog in blogs:
            blog_list.append({
                "id": blog.id,
                "title": blog.title,
                "date": blog.date.strftime('%Y-%m-%d'),
                "body": blog.body.body
            })
        return jsonify(blog_list)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error":"Could not fetch blogs"}), 500

@app.route("/blogs/<int:blog_id>/comments", methods=["GET"])
def get_comments(blog_id): 
    blog = Blog.query.get_or_404(blog_id)
    comments = [
        {
            "id": c.id,
            "content": c.content,
            "author": c.user.username if c.user else "Anonymous",
            "timestamp": c.timestamp.isoformat()
        }
        for c in blog.comments
    ]
    return jsonify(comments), 200

@app.route("/my-favorite-blogs", methods=["GET"])
def myFavoriteBlogs():
    user = get_user(request)
    if not user:
        return jsonify({"error": "Not authorized"}), 401
    
    print(f"Fetching favorites for user {user.id}")

    favorites = db.session.query(favBlog, Blog, User)\
        .join(Blog, favBlog.blog_id == Blog.id)\
        .join(User, Blog.user_id == User.id)\
        .filter(favBlog.user_id == user.id)\
        .all()
    for (fav,blog,user) in favorites:
        print(fav)
        print(blog)
        print(user)
        print(fav.id)
        print(fav.blog)
    return jsonify([fav.blog.serialize() for (fav,blog,user) in favorites])

@app.route("/blogs/<int:blog_id>/comments", methods=["POST"])
def add_comment(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    user = get_user(request)
    if not user:
        return jsonify({"error": "Not authorized"}), 401

    if not request.is_json:
        return jsonify({"error": "Invalid request type"}), 415

    data = request.get_json()
    content = data.get("content", "").strip()
    if not content:
        return jsonify({"error": "Comment content is required"}), 400

    comment = Comment(content=content, blog=blog, user=user)
    db.session.add(comment)
    db.session.commit()

    return jsonify({
        "id": comment.id,
        "content": comment.content,
        "author": user.username,
        "timestamp": comment.timestamp.isoformat()
    }), 201
# 

# ARCHIVE PATHS

def auto_delete_old_workouts():
    print("Checking for expired workouts...")


    expiration_threshold = datetime.now(timezone.utc).date() - timedelta(days=90)

    try:
        db.session.execute(
            delete(Workout).where(Workout.date < expiration_threshold)
        )
        db.session.commit()
        print("✅ Old workouts deleted successfully.")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting old workouts: {e}")

@app.route("/my-workouts", methods=["GET"])
def get_my_workouts():
    user = get_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    workouts = Workout.query.filter_by(user_id=user.id).order_by(Workout.date.desc()).all()
    result = [{
        "id": workout.id,
        "date": workout.date.strftime("%Y-%m-%d")
    } for workout in workouts]

    return jsonify(result), 200

@app.route("/my-workouts/<int:workout_id>", methods=["GET"])
def get_workout_details(workout_id):
    user = get_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    workout = Workout.query.filter_by(id=workout_id, user_id=user.id).first()
    if not workout:
        return jsonify({"error": "Workout not found"}), 404

    return jsonify({
        "id": workout.id,
        "date": workout.date.strftime("%Y-%m-%d"),
        "exercises": [{
            "name": ex.name,
            "sets": ex.sets,
            "reps": ex.reps,
            "weight": ex.weight
        } for ex in workout.exercises]
    }), 200

@app.route("/my-workouts/<int:workout_id>", methods=["DELETE"])
def delete_workout(workout_id):
    user = get_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    workout = Workout.query.filter_by(id=workout_id, user_id=user.id).first()
    if not workout:
        return jsonify({"error": "Workout not found"}), 404

    # Delete exercises first (if cascade isn't set up)
    for exercise in workout.exercises:
        db.session.delete(exercise)

    db.session.delete(workout)
    db.session.commit()

    return jsonify({"message": "Workout deleted"}), 200



@app.route("/create-workout", methods=["POST"])
def create_workout():
    user = get_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    date = data.get("date")
    exercises_data = data.get("exercises", [])

    try:
        workout = Workout(date=date, user_id=user.id)
        db.session.add(workout)

        # Add each exercise individually, linking it to the workout
        for ex in exercises_data:
            exercise = Exercise(
                name=ex["name"],
                sets=ex["sets"],
                reps=ex["reps"],
                weight=ex["weight"],
                workout=workout  # ← This links the exercise properly
            )
            db.session.add(exercise)

        db.session.commit()
        return jsonify({"message": "Workout created successfully"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating workout: {e}")
        return jsonify({"error": "Failed to create workout"}), 500
    
@app.route("/archive", methods=["GET"])
def grab_archive():
    users = db.session.query(User).join(Workout).distinct().all()
    results = [{"id": u.id, "username": u.username} for u in users]
    return jsonify(results)

@app.route("/archive/<id>", methods=["GET"])
def grab_users_archive(id):
    workouts = Workout.query.filter_by(user_id=id).all()
    if not workouts:
        return jsonify({"message": "No Archived workouts"}), 404
    workout_data = []
    for workout in workouts:
        exercises= [{"name": ex.name, "sets": ex.sets, "reps": ex.reps, "weight": ex.weight} for ex in workout.exercises]
        workout_data.append({
            "date": workout.date,
            "exercises": exercises
        })
    return jsonify(workout_data),200


if __name__ == "__main__":
    with app.app_context():
        auto_delete_old_workouts() 
    if os.environ.get("FLASK_ENV") == "development":
        app.run(debug=True, host="0.0.0.0", port=port, ssl_context=("cert.pem", "key.pem"))
    else:
        app.run(debug=True, host="0.0.0.0", port=port)


