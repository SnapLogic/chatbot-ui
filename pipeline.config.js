const pipelineConfig = {
    "pipelines": [
        {
            "id": 0,
            "name": "RAG",
            "url": "http://localhost:8888/api/1/rest/***********/RAG%20Task",
            "apiKey": "********************************"
        },
        {
            "id": 1,
            "name": "Index",
            "url": "http://localhost:8888/api/1/rest/***********/IndexTask",
            "apiKey": "********************************"
        },
        {
            "id": 2,
            "name": "Embedding",
            "url": "http://localhost:8888/api/1/rest/***********/EmbeddingTask",
            "apiKey": "********************************"
        }
    ]
}