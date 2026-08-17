from flask import Flask, render_template, request, jsonify
from groq import Groq
import os

app = Flask(__name__)

client = Groq(api_key=os.getenv("GROK_API_KEY"))

supabase: Client = create_client("https://awpbaqarpneslqbwmcuq.supabase.co", os.getenv("SUPABASE_KEY"))

freshness_data = {
    "temperature": "",
    "humidity": "",
    "freshness": ""
}

def create_session(user_id):
    token = secrets.token_hex(32)

    supabase.table("session_tokens").insert({
        "user_id": user_id,
        "session_token": token
    }).execute()

    return token

def get_user_from_session():
    token = request.headers.get("session-token")

    if not token:
        return None

    session = (
        supabase
        .table("session_tokens")
        .select("user_id")
        .eq("session_token", token)
        .execute()
    )

    if len(session.data) == 0:
        return None

    user_id = session.data[0]["user_id"]

    user = (
        supabase
        .table("Users")
        .select("*")
        .eq("id", user_id)
        .execute()
    )

    if len(user.data) == 0:
        return None

    return user.data[0]

@app.route('/register-user', methods=["POST"])
def register_user():
    data = request.get_json()

    name = data["name"]
    age = data["age"]
    loginid = data["loginid"]
    email = data["email"]
    password = data["password"]

    same_user = supabase.table("Users").select("*").or_(f"full_name.eq.{name},loginid.eq.{loginid},email.eq.{email},password.eq.{password}").execute()

    if len(same_user.data) > 0:
        return jsonify(success=False)

    user_reg = supabase.table("Users").insert({
        "full_name": name,
        "loginid": loginid,
        "age": age,
        "password": password,
        "email": email
    }).execute()

    user = supabase.table("Users").select("*").eq("loginid", loginid).execute()
    
    if len(user.data) == 0:
        return jsonify(success=False)

    user = user.data[0]

    if user["password"] != password:
        return jsonify(success=False)

    token = create_session(user["id"])

    return jsonify(
        success=True,
        session_token=token
    )

@app.route('/check-user-login', methods=["POST"])
def check_user_login():
    data = request.get_json()

    loginid = data["loginid"]
    password = data["password"]

    user = supabase.table("Users").select("*").eq("loginid", loginid).execute()

    if len(user.data) == 0:
        return jsonify(success=False)

    user = user.data[0]

    if user["password"] != password:
        return jsonify(success=False)

    token = create_session(user["id"])

    return jsonify(
        success=True,
        session_token=token
    )

@app.route("/logout", methods=["POST"])
def logout():
    token = request.headers.get("session-token")

    if not token:
        return jsonify(success=True)

    supabase.table("session_tokens").delete().eq(
        "session_token", token
    ).execute()

    return jsonify(success=True)

@app.route("/fetch-user-details")
def fetch_diary_entries():
    user = get_user_from_session()

    if user is None:
        return jsonify(error="unauthorized"), 401

    entries = (
        supabase
        .table("Users")
        .select("*")
        .eq("id", user["id"])
        .order("created_at", desc=True)
        .execute()
    )

    return jsonify(entries.data[0])

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/')
def main_page():
    return render_template('index.html')

@app.route('/predict')
def predict():
    return render_template('predict.html')

@app.route('/preserve')
def preserve():
    return render_template('preserve.html')

@app.route('/provide')
def provide():
    return render_template('provide.html')

@app.route('/recipes')
def recipes():
    return render_template('recipes.html')

@app.route("/api/recipes", methods=["GET", "POST"])
def recipes_api():
    data = request.json
    message = data.get("message", "")
    items = data.get("items", [])

    system_prompt = f"""
                You are a Recipe AI developed by Joel Mendonca, Naisha Gupta, Aswin Kumaran, and Jasmitha Krishna (aka Jeshwara). If asked about your identity, tell them this.

                Answer in plain text only.
                Do not use markdown.
                Use normal paragraphs.
                Try to use 300 words every time.
                Explain in bullets points + short lines.
                Only respond to questions related to food recipes and food wastage. If the user asks anything else, tell them that you can only help with things related to food recipes.
                Always respond kindly to the user.

                User's Available foods and expiry risk scores: {items}

                When asked about a recipe suggestion, try to include some food that have ingredients not included above, and ingredients included above, if there are any. Also mention that you have taken those ingredients from the user's statistics.

                If asked about recipes, include a minimum of 5-6 different recipes, with minimum of 4 recipes which have ingredients that the user doesn't have and 2-3 recipes which have ingredients that the user has.
                
                When recommending recipes to the user, if an item has a higher expiry risk score, try to suggest recipes that use a lot of that ingredient.
                """

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ]
        )

        return jsonify({
            "reply": response.choices[0].message.content
        })

    except Exception as e:
        return jsonify({
            "reply": f"Error: {str(e)}"
        })
    
@app.route("/devices")
def devices():
    return render_template('devices.html')

@app.route("/module-input")
def module_input():
    return render_template('module-input.html')

@app.route("/module-reg")
def module_reg():
    return render_template('module-reg.html')

@app.route("/update-freshness", methods=["POST"])
def update_freshness():
    global freshness_data

    data = request.json

    freshness_data["temperature"] = data.get("temperature", "")
    freshness_data["humidity"] = data.get("humidity", "")
    freshness_data["alcohol"] = data.get("alcohol", "")

    return jsonify({
        "success": True
    })

@app.route("/get-freshness")
def get_freshness():
    return jsonify(freshness_data)

@app.route("/notifications")
def notifications():
    return render_template('notifications.html')

@app.route("/eco-bucket")
def eco_bucket():
    return render_template('eco-bucket.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
