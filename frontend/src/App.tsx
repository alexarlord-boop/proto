import { Button } from "@/components/ui/button"

function App() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center">
            <Button onClick={
                async () => {
                    try {
                        const response = await fetch("http://127.0.0.1:8000/");
                        const data = await response.json();
                        console.log(data);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }>Click me</Button>
        </div>
    )
}

export default App