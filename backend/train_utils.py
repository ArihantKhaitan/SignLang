import cv2
import numpy as np
import os
from glob import glob
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical
from model import get_model, save_model
import json

IMAGE_X, IMAGE_Y = 50, 50

def load_data(data_dir="gestures"):
    images = []
    labels = []
    label_map = {}
    
    # Get all gesture folders
    gesture_folders = [f for f in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, f))]
    gesture_folders.sort()
    
    for i, gesture_name in enumerate(gesture_folders):
        label_map[i] = gesture_name
        gesture_path = os.path.join(data_dir, gesture_name)
        image_files = glob(os.path.join(gesture_path, "*.jpg"))
        
        for file in image_files:
            img = cv2.imread(file, 0) # Read as grayscale
            if img is not None:
                img = cv2.resize(img, (IMAGE_X, IMAGE_Y))
                images.append(img)
                labels.append(i)
                
    return np.array(images), np.array(labels), label_map

def train_classifier():
    if not os.path.exists("gestures"):
        return False, "No data found"
        
    images, labels, label_map = load_data()
    
    if len(images) == 0:
        return False, "No images found"
        
    num_classes = len(label_map)
    
    # Save label map
    with open("label_map.json", "w") as f:
        json.dump(label_map, f)
        
    # Preprocess
    images = images.reshape(images.shape[0], IMAGE_X, IMAGE_Y, 1)
    images = images.astype('float32') / 255.0
    
    labels = to_categorical(labels, num_classes)
    
    X_train, X_val, y_train, y_val = train_test_split(images, labels, test_size=0.2, random_state=42)
    
    model = get_model(num_classes, IMAGE_X, IMAGE_Y)
    model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=10, batch_size=32)
    
    save_model(model, "cnn_model.h5")
    
    return True, "Training completed"
