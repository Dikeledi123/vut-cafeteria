<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'User not logged in']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $cart = $input['cart'];
    $total = $input['total'];

    try {
        // Create orders table if it doesn't exist
        $createOrdersTableSQL = "
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            order_data TEXT NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            status ENUM('pending', 'preparing', 'ready', 'completed') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )";
        $pdo->exec($createOrdersTableSQL);

        // Insert order
        $order_data = json_encode($cart);
        $stmt = $pdo->prepare("INSERT INTO orders (user_id, order_data, total) VALUES (?, ?, ?)");
        $stmt->execute([$user_id, $order_data, $total]);

        echo json_encode([
            'success' => true, 
            'message' => 'Order placed successfully!',
            'order_id' => $pdo->lastInsertId()
        ]);

    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>