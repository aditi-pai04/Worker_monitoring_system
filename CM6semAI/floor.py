import cv2
import numpy as np

# Load the image
image = cv2.imread('floor_pan.jpg')

# Convert the image to HSV color space for better color detection
hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

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
    cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
    
    # Mark the zone with a unique ID
    cv2.putText(image, f'Zone {i + 1}', (x + 10, y + 30), cv2.FONT_HERSHEY_SIMPLEX, 1,(255, 0, 0), 2)

# Save or display the result
cv2.imwrite('labeled_floor_plan.png', image)
cv2.imshow('Labeled Floor Plan', image)
cv2.waitKey(0)
cv2.destroyAllWindows()
