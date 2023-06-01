import sys
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_email(receiver_email):
    sender_email = "your-email@example.com"
    password = "your-email-password"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Welcome to Personal Finance Tracker"
    message["From"] = sender_email
    message["To"] = receiver_email

    html = """
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
                padding: 20px;
            }

            h1 {
                color: #333;
                text-align: center;
            }

            p {
                color: #555;
                font-size: 16px;
                line-height: 1.5;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <h1>Welcome to Personal Finance Tracker</h1>
        <div class="container">
            <p>Thank you for signing up! Start managing your finances now.</p>
        </div>
    </body>
    </html>
    """

    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        print("Email sent successfully!")
    except Exception as e:
        print("An error occurred while sending the email:", str(e))

# Fetch the receiver email from command line argument
if len(sys.argv) < 2:
    print("Usage: python send_email.py <receiver_email>")
    sys.exit(1)

recipient_email = sys.argv[1]
send_email(recipient_email)
