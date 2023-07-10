import requests

def get_seat_data():
    url = f"http://34.93.13.211/api/seats"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        if not data:
            print("No data")
        else:
            print(str(data))
    else:
        print("Error:", response.status_code)

# Test the API for seat IDs 1 to 500
get_seat_data()
