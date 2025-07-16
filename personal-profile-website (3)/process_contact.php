<?php
// Set content type to JSON
header('Content-Type: application/json');

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to sanitize input data
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Function to validate email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to validate phone number
function validatePhone($phone) {
    return preg_match('/^[\+]?[0-9\s\-$$$$]+$/', $phone);
}

// Response array
$response = array(
    'success' => false,
    'message' => '',
    'errors' => array()
);

// Check if form was submitted via POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

// Get and sanitize form data
$name = isset($_POST['name']) ? sanitizeInput($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
$phone = isset($_POST['phone']) ? sanitizeInput($_POST['phone']) : '';
$subject = isset($_POST['subject']) ? sanitizeInput($_POST['subject']) : '';
$message = isset($_POST['message']) ? sanitizeInput($_POST['message']) : '';

// Server-side validation
$errors = array();

// Validate name
if (empty($name)) {
    $errors['name'] = 'Name is required.';
} elseif (strlen($name) < 2) {
    $errors['name'] = 'Name must be at least 2 characters long.';
} elseif (!preg_match('/^[a-zA-Z\s]+$/', $name)) {
    $errors['name'] = 'Name can only contain letters and spaces.';
}

// Validate email
if (empty($email)) {
    $errors['email'] = 'Email is required.';
} elseif (!validateEmail($email)) {
    $errors['email'] = 'Please enter a valid email address.';
}

// Validate phone (optional field)
if (!empty($phone) && !validatePhone($phone)) {
    $errors['phone'] = 'Please enter a valid phone number.';
}

// Validate subject
if (empty($subject)) {
    $errors['subject'] = 'Subject is required.';
} elseif (strlen($subject) < 5) {
    $errors['subject'] = 'Subject must be at least 5 characters long.';
}

// Validate message
if (empty($message)) {
    $errors['message'] = 'Message is required.';
} elseif (strlen($message) < 10) {
    $errors['message'] = 'Message must be at least 10 characters long.';
}

// If there are validation errors, return them
if (!empty($errors)) {
    $response['message'] = 'Please correct the errors below.';
    $response['errors'] = $errors;
    echo json_encode($response);
    exit;
}

// Prepare data for saving
$contactData = array(
    'timestamp' => date('Y-m-d H:i:s'),
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'subject' => $subject,
    'message' => $message,
    'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
);

// Format data for text file
$dataString = "=== NEW CONTACT MESSAGE ===" . PHP_EOL;
$dataString .= "Timestamp: " . $contactData['timestamp'] . PHP_EOL;
$dataString .= "Name: " . $contactData['name'] . PHP_EOL;
$dataString .= "Email: " . $contactData['email'] . PHP_EOL;
$dataString .= "Phone: " . ($contactData['phone'] ?: 'Not provided') . PHP_EOL;
$dataString .= "Subject: " . $contactData['subject'] . PHP_EOL;
$dataString .= "Message: " . PHP_EOL . $contactData['message'] . PHP_EOL;
$dataString .= "IP Address: " . $contactData['ip_address'] . PHP_EOL;
$dataString .= "User Agent: " . $contactData['user_agent'] . PHP_EOL;
$dataString .= "=========================" . PHP_EOL . PHP_EOL;

// Save to text file
$filename = 'contact_messages.txt';
$result = file_put_contents($filename, $dataString, FILE_APPEND | LOCK_EX);

if ($result === false) {
    $response['message'] = 'Failed to save message. Please try again.';
    echo json_encode($response);
    exit;
}

// Success response
$response['success'] = true;
$response['message'] = 'Thank you for your message! I will get back to you soon.';

echo json_encode($response);
?>
