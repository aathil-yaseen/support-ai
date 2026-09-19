from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

text = "My payment failed"

embedding = model.encode(text)

print("Embedding generated successfully!")
print("Vector size:", len(embedding))
print("First 5 values:", embedding[:5])