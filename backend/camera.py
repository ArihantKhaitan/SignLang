import cv2
import numpy as np
import pickle
import os
import threading

class Camera:
    def __init__(self):
        self.video = cv2.VideoCapture(0)
        self.lock = threading.Lock()
        self.hist = self.get_hand_hist()
        self.x, self.y, self.w, self.h = 300, 100, 300, 300

    def __del__(self):
        self.video.release()

    def get_hand_hist(self):
        hist_path = "hist"
        if os.path.exists(hist_path):
            with open(hist_path, "rb") as f:
                return pickle.load(f)
        return None

    def set_hand_hist(self, frame):
        # Logic to create histogram from a specific region
        # For now, we'll assume it's pre-calculated or we'll add a method to calculate it
        pass

    def get_frame(self):
        success, img = self.video.read()
        if not success:
            return None
        
        img = cv2.flip(img, 1)
        imgHSV = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        thresh = None
        if self.hist is not None:
            dst = cv2.calcBackProject([imgHSV], [0, 1], self.hist, [0, 180, 0, 256], 1)
            disc = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(10,10))
            cv2.filter2D(dst,-1,disc,dst)
            blur = cv2.GaussianBlur(dst, (11,11), 0)
            blur = cv2.medianBlur(blur, 15)
            thresh = cv2.threshold(blur,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)[1]
            thresh = cv2.merge((thresh,thresh,thresh))
            thresh = cv2.cvtColor(thresh, cv2.COLOR_BGR2GRAY)
            thresh = thresh[self.y:self.y+self.h, self.x:self.x+self.w]
        
        cv2.rectangle(img, (self.x,self.y), (self.x+self.w, self.y+self.h), (0,255,0), 2)
        
        ret, jpeg = cv2.imencode('.jpg', img)
        return jpeg.tobytes(), thresh

    def get_processed_frame(self):
        # Returns the thresholded image for prediction
        success, img = self.video.read()
        if not success:
            return None
        
        img = cv2.flip(img, 1)
        imgHSV = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        if self.hist is not None:
            dst = cv2.calcBackProject([imgHSV], [0, 1], self.hist, [0, 180, 0, 256], 1)
            disc = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(10,10))
            cv2.filter2D(dst,-1,disc,dst)
            blur = cv2.GaussianBlur(dst, (11,11), 0)
            blur = cv2.medianBlur(blur, 15)
            thresh = cv2.threshold(blur,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)[1]
            thresh = cv2.merge((thresh,thresh,thresh))
            thresh = cv2.cvtColor(thresh, cv2.COLOR_BGR2GRAY)
            thresh = thresh[self.y:self.y+self.h, self.x:self.x+self.w]
            return thresh
        return None
