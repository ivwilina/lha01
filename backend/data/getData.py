from re import match
from bs4 import BeautifulSoup
import requests
import csv
import os

url = "https://flyer.vn/1000-tu-vung-ielts-theo-chu-de-xa-hoi-quan-tam/"
response = requests.get(url)
soup = BeautifulSoup(response.content, "html.parser")
categoryTitle = soup.find_all("h3", class_="wp-block-heading")
category = soup.find_all("figure", class_="wp-block-table")
categoryCount = len(categoryTitle) if len(categoryTitle) > len(category) else len(category)

folder = os.path.dirname(os.path.abspath(__file__))  # Thư mục chứa getData.py

for i in range(categoryCount):
    splittedTitle = (categoryTitle[i].text.split(". ")[1]).split(" (")[0]
    formattedTitle = splittedTitle.replace(" ", "_").lower()
    file_path = os.path.join(folder, f"{formattedTitle}.csv")

    with open(file_path, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["word", "partOfSpeech", "IPA", "meaning", "example", "exampleForQuiz"])
        
        words = category[i].find_all("tr")
        for w in words:
          info = w.find_all("td")
          if len(info) >= 5:
            word = info[0].text
            partOfSpeechRaw = info[1].text
            partOfSpeech = info[1].text
            match partOfSpeechRaw:
              case "n":
                partOfSpeech = "noun"
              case "v":
                partOfSpeech = "verb"
              case "adj":
                partOfSpeech = "adjective"
              case "adv":
                partOfSpeech = "adverb"
              case "phr":
                partOfSpeech = "phrase"
            ipa = info[2].text
            meaning = info[3].text
            exampleRaw = info[4]
            for em in exampleRaw.find_all("em"):
                  em.extract()
            example = exampleRaw.get_text(strip=True)
            for strong in exampleRaw.find_all("strong"):
                  strong.replace_with(' ' + ('_' * len(strong.get_text())) + ' ')
            exampleWithoutWord = exampleRaw.get_text(strip=True)
            writer.writerow([word, partOfSpeech, ipa, meaning, example, exampleWithoutWord])
