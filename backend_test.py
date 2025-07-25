import requests
import sys
import json
from datetime import datetime
import base64

class CouplesMemoryAPITester:
    def __init__(self, base_url="https://3815bc59-f133-437e-a680-6ae9a0b36516.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_memory_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_create_memory(self):
        """Test creating a new memory"""
        # Create a simple base64 image (1x1 pixel red PNG)
        sample_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        
        memory_data = {
            "title": "Our First Date",
            "description": "A magical evening at the park where we first met and talked for hours under the stars.",
            "memory_date": "2024-01-15",
            "couple_name1": "Alice",
            "couple_name2": "Bob",
            "tags": ["romantic", "first-date", "park"],
            "image_data": sample_image
        }
        
        success, response = self.run_test("Create Memory", "POST", "memories", 201, memory_data)
        if success and 'id' in response:
            self.created_memory_id = response['id']
            print(f"   Created memory with ID: {self.created_memory_id}")
        return success

    def test_get_all_memories(self):
        """Test getting all memories"""
        return self.run_test("Get All Memories", "GET", "memories", 200)

    def test_get_specific_memory(self):
        """Test getting a specific memory by ID"""
        if not self.created_memory_id:
            print("❌ Skipping - No memory ID available")
            return False
        
        return self.run_test("Get Specific Memory", "GET", f"memories/{self.created_memory_id}", 200)

    def test_get_memories_by_couple(self):
        """Test getting memories by couple names"""
        return self.run_test("Get Memories by Couple", "GET", "memories/couple/Alice/Bob", 200)

    def test_create_memory_without_image(self):
        """Test creating a memory without image"""
        memory_data = {
            "title": "Anniversary Dinner",
            "description": "Celebrating our one year anniversary at our favorite restaurant.",
            "memory_date": "2024-02-14",
            "couple_name1": "Alice",
            "couple_name2": "Bob",
            "tags": ["anniversary", "dinner", "celebration"]
        }
        
        return self.run_test("Create Memory (No Image)", "POST", "memories", 201, memory_data)

    def test_delete_memory(self):
        """Test deleting a memory"""
        if not self.created_memory_id:
            print("❌ Skipping - No memory ID available")
            return False
        
        return self.run_test("Delete Memory", "DELETE", f"memories/{self.created_memory_id}", 200)

    def test_invalid_memory_id(self):
        """Test getting a non-existent memory"""
        return self.run_test("Get Invalid Memory", "GET", "memories/invalid-id-123", 404)

def main():
    print("🚀 Starting Couple's Memory Storage API Tests")
    print("=" * 60)
    
    tester = CouplesMemoryAPITester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_create_memory,
        tester.test_get_all_memories,
        tester.test_get_specific_memory,
        tester.test_get_memories_by_couple,
        tester.test_create_memory_without_image,
        tester.test_delete_memory,
        tester.test_invalid_memory_id
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())