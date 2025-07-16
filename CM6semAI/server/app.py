from flask import Flask, request, jsonify, send_from_directory,send_file, Response
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import random
from flask import send_file
import os
import cv2
import numpy as np
from pymongo import MongoClient
import io
import random

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from your React Native app

UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
SAVE_FOLDER = 'maps'
if not os.path.exists(SAVE_FOLDER):
    os.makedirs(SAVE_FOLDER)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
client = MongoClient('mongodb+srv://aditinpai:Aditi$04@aicm.c4ywj.mongodb.net/?retryWrites=true&w=majority&appName=AICM')
db = client['test']
blueprint_path = 'C:/Users/aditi/OneDrive/Desktop/6th_el/CM6semAI/server/processed/blueprint.jpg'
blueprints_collection = db['blueprints']
logs_collection = db['logs']
workers_collection = db['workers']

@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if file:
        detected_zones = []
        # Save the original file
        original_file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(original_file_path)
        
        # Load the image using PIL
        image = Image.open(original_file_path).convert('RGB')
        
        # Convert PIL image to a NumPy array
        image_np = np.array(image)
        
        # Convert the RGB image to HSV
        hsv_image = cv2.cvtColor(image_np, cv2.COLOR_RGB2HSV)

        # Define the red color range in HSV
        lower_red1 = np.array([0, 70, 50])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 70, 50])
        upper_red2 = np.array([180, 255, 255])

        # Create a mask for the red color (covering both ends of the red spectrum)
        mask1 = cv2.inRange(hsv_image, lower_red1, upper_red1)
        mask2 = cv2.inRange(hsv_image, lower_red2, upper_red2)
        mask = cv2.bitwise_or(mask1, mask2)

        # Apply a Gaussian blur to the mask to reduce noise
        mask = cv2.GaussianBlur(mask, (5, 5), 0)

        # Find contours in the mask
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Loop through the contours and draw bounding boxes
        for i, contour in enumerate(contours):
            # Approximate the contour to reduce the number of points
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)

            # Get the bounding box coordinates from the approximated contour
            x, y, w, h = cv2.boundingRect(approx)
            
            # Draw the rectangle around the detected zone
            cv2.rectangle(image_np, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            # Mark the zone with a unique ID
            cv2.putText(image_np, f'Zone {i + 1}', (x + 10, y + 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
            zone_data = {
                'zone_id': i + 1,
                'coordinates': {'x': x, 'y': y, 'width': w, 'height': h}
            }
            detected_zones.append(zone_data)

        # Convert the modified NumPy array back to PIL image
        processed_image = Image.fromarray(image_np)

        # Save the processed image
        processed_image_path = os.path.join(PROCESSED_FOLDER, 'blueprint.jpg')
        print(processed_image_path)
        blueprint_path=processed_image_path
        processed_image.save(processed_image_path)
        blueprints_collection.insert_one({
            'blueprint_name': file.filename,
            'zones': detected_zones
        })

        return jsonify({'message': 'Image processed successfully'}), 200

@app.route('/processed-image', methods=['GET'])
def serve_processed_image():
    return send_from_directory(PROCESSED_FOLDER, 'blueprint.jpg')


@app.route('/live-map', methods=['GET'])
def live_map():
    workers = {worker['uuid']: worker['name'] for worker in workers_collection.find()}

    pipeline = [
        {"$match": {"deviceUUID": {"$in": list(workers.keys())}}},
        {"$sort": {"timestamp": -1}},
        {"$group": {
            "_id": "$deviceUUID",
            "mostRecentLog": {"$first": "$$ROOT"}
        }}
    ]
    recent_logs = list(logs_collection.aggregate(pipeline))

    image = Image.open('processed/blueprint.jpg').convert('RGB')
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()
    placed_dots = []

    # Define the margin (1 cm in pixels)
    cm_in_pixels = 38

    logs_by_device = {}
    for log in recent_logs:
        device_uuid = log['_id']
        most_recent_log = log['mostRecentLog']['logs'][-1]
        logs_by_device[device_uuid] = most_recent_log

    blueprints = list(blueprints_collection.find())

    for device_uuid, log in logs_by_device.items():
        worker_name = workers[device_uuid]
        scanner_id = log['scannerId']

        for blueprint in blueprints:
            zone = next((z for z in blueprint['zones'] if z['esp_uuid'] == scanner_id), None)

            if zone:
                # Ensure that the dot is placed at least 1 cm (38 pixels) inside the zone
                x, y, width, height = zone['coordinates']['x'], zone['coordinates']['y'], zone['coordinates']['width'], zone['coordinates']['height']

                # Adjust the range to ensure the dot stays within the zone, at least 1 cm away from the edges
                min_x = x + cm_in_pixels
                max_x = x + width - cm_in_pixels
                min_y = y + cm_in_pixels
                max_y = y + height - cm_in_pixels

                # Ensure valid placement within zone boundaries
                if min_x < max_x and min_y < max_y:
                    while True:
                        dot_x = random.randint(min_x, max_x)
                        dot_y = random.randint(min_y, max_y)

                        # Ensure there's enough distance from previously placed dots
                        if all((dot_x - dx)**2 + (dot_y - dy)**2 > 100 for dx, dy in placed_dots):
                            placed_dots.append((dot_x, dot_y))
                            break

                    dot_radius = 5
                    draw.ellipse([(dot_x - dot_radius, dot_y - dot_radius), (dot_x + dot_radius, dot_y + dot_radius)], fill='red')
                    draw.text((dot_x + 10, dot_y - 10), worker_name, fill='black', font=font)

    image_path = os.path.join(SAVE_FOLDER, 'live_map.png')
    image.save(image_path, 'PNG')
    image_url = f'http://localhost:5001/maps/live_map.png'
    return jsonify({"image_url": image_url})

@app.route('/maps/<path:filename>')
def serve_map(filename):
    file_path = os.path.join(SAVE_FOLDER, filename)
    print(file_path)
    if os.path.exists(file_path):
        return send_file(file_path)
    else:
        return jsonify({'message': 'File not found'}), 404
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
