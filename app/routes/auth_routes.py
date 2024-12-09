from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import login_user, logout_user
from app.models import db, User

auth_routes = Blueprint('auth', __name__)

@auth_routes.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username').strip()
        email = request.form.get('email').strip()
        password = request.form.get('password')

        errors = []

        # Check if username and email are at least 4 characters
        if len(username) < 4:
            errors.append("Username must be at least 4 characters.")
        if len(email) < 4:
            errors.append("Email must be at least 4 characters.")

        # Check for duplicate username or email
        if User.query.filter_by(username=username).first():
            errors.append("Username is already taken.")
        if User.query.filter_by(email=email).first():
            errors.append("Email is already registered.")

        # If there are errors, re-render the signup page with error messages
        if errors:
            return render_template('signup.html', errors=errors, form_data={'username': username, 'email':email})

        # Create a new user if no errors
        user = User(username=username, email=email)
        user.password = password  # Hash the password
        db.session.add(user)
        db.session.commit()

        # Automatically log the user in
        login_user(user)

        # Redirect to homepage
        return redirect(url_for('home'))

    return render_template('signup.html')

@auth_routes.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        # Find the user by email
        user = User.query.filter_by(email=email).first()

        # Validate the user and password
        if not user or not user.check_password(password):
            return render_template('login.html', error="Invalid email or password")

        # Log the user in
        login_user(user)

        # Redirect to a user to homepage
        return redirect(url_for('home'))
    return render_template('login.html')


@auth_routes.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('auth.login'))


@auth_routes.route('/demo-login', methods=['GET'])
def demo_login():
    user = User.query.filter_by(email="demo@aa.io").first()
    # Validate the user and password
    if not user:
        return render_template('login.html', error="Demo user not found")

    login_user(user)

    # Redirect to a user to homepage
    return redirect(url_for('home'))
