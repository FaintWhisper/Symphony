# Music Player

A Electron based app that features a clean and modern design, and comes along with nice functions like:
1. Speech recognition to play inmediatly the song that just came up to your mind without the need to search for it.
2. Album and songs view.
3. Random music play using the Fisher-Yates algorithm.
4. Enqueue and play next functionality.
5. Media Keys support: Control the music reporduction no matter what you are doing.

## Screenshots
<div align="center">
    <img src="/screenshots/1.png" width="700px"></img>
    <br>
    <img src="/screenshots/2.png" width="700px"></img>
</div>

## Building
First make sure you have Node JS and Electron are already installed in your system before starting the process.

Steps:
1. Clone this repo to your system
2. Create a /bin folder inside the root directory of the project.
3. Download SOX (http://sox.sourceforge.net/) and ExifTools (https://exiftool.org/) binaries and place them inside the '/bin' folder you just created.
4. [Optional] If you want to use the speech recognition service, you will need to request an API token for the Microsoft Cognitive Service (you can get it here: https://azure.microsoft.com/es-es/services/cognitive-services/speaker-recognition/). Now create a text file named 'API_TOKEN.txt' inside the root directory and type there the API token you just get.
5. Open a terminal and type the following:
   > npm install
   
   > npm run dist
6. Wait for the installation to complete.

That's all! 'A dist' folder will be generated with all the binaries you need to get up and running with the program.

## Use
After the building step is finished, you will have two versions of the program in your system, the first one will be a classic installer to install the software in your system, the second one will be a portable copy you can run directly from anywhere you want. Use the one that best suits your needs.

## Built With

* [Electron JS](https://www.electronjs.org/) - Framework used to develope native desktop applications using just web technologies.

## Contributing

If you want to contribute to this project you're more than welcome, just send a pull request and you are done!

## Authors

* **Amit Karamchandani Batra** - [RYSKZ](https://github.com/RYSKZ)

## License

This project is licensed under the GNU v3.0 License - see the [LICENSE.txt](LICENSE.txt) file for details

## Acknowledgments

* Thanks to Lokesh Dakar for his useful 'Color Thief' library: https://lokeshdhakar.com/projects/color-thief/
