const names = ["Boba-Fett", "IG-88", "Bossk", "Lando-Calrissian", "Lobot", "Ackbar", "Mon-Mothma", "Arvel-Crynyd", "Wicket-Systri-Warrick", "Nien-Nunb", "Anakin-Skywalker", "Wilhuff-Tarkin", "Chewbacca", "Han-Solo", "Greedo", "Jabba-Desilijic-Tiure", "Wedge-Antilles", "Jek-Tono-Porkins", "Yoda", "Palpatine", "Luke-Skywalker", "C-3PO", "R2-D2", "Darth-Vader", "Leia-Organa", "Owen-Lars", "Beru-Whitesun-Lars", "R5-D4", "Biggs-Darklighter", "Obi-Wan-Kenobi", "Qui-Gon-Jinn", "Nute-Gunray", "Finis-Valorum", "Padme-Amidala", "Jar-Jar-Binks", "Roos-Tarpals", "Rugor-Nass", "Ric-Olie", "Watto", "Sebulba", "Quarsh-Panaka", "Shmi-Skywalker", "Darth-Maul", "Bib-Fortuna", "Ayla-Secura", "Ratts-Tyerel", "Dud-Bolt", "Gasgano", "Ben-Quadinaros", "Mace-Windu", "Ki-Adi-Mundi", "Kit-Fisto", "Eeth-Koth", "Adi-Gallia", "Saesee-Tiin", "Yarael-Poof", "Plo-Koon", "Mas-Amedda", "Gregar-Typho", "Corde", "Cliegg-Lars", "Poggle-the-Lesser", "Luminara-Unduli", "Barriss-Offee", "Dorme", "Dooku", "Bail-Prestor-Organa", "Jango-Fett", "Zam-Wesell", "Dexter-Jettster", "Lama-Su", "Taun-We", "Jocasta-Nu", "R4-P17", "Wat-Tambor", "San-Hill", "Shaak-Ti", "Grievous", "Tarfful", "Raymus-Antilles", "Sly-Moore", "Tion-Medon", "Finn", "Rey", "Poe-Dameron", "BB8"]

function get_node_name() {
    var macAddress = require('macaddress').networkInterfaces()[require('../../conf/config').interface].mac;
    if (macAddress) {
        const hash = macAddress.replace(/(:|[a-z])/g, '');

        const mod = hash % names.length;
        const id = hash.substr(hash.length - 2, hash.length - 1);

        return names[mod] + '-' + id;
    }
    else {
        return new Date().getTime().toString().substr(9, 13);
    }
}

module.exports.getNodeName = get_node_name;