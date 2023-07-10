import requests

def get_seat_data(seat_id):
    url = f"http://34.93.13.211/api/seats/{seat_id}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        if not data:
            print("No data")
        else:
            print(str(seat_id) + ":" + str(data))
    else:
        print("Error:", response.status_code)

# Test the API for seat IDs 1 to 500
for seat_id in range(1, 11):
    get_seat_data(seat_id)
