// Form Modal
var btnCreat = document.querySelector("#btnCreat");
var btnSaveOrUpdate = document.querySelector("#btnSave");
var btnFindPerson = document.querySelector("#btnFindPerson");

var modalTitle = document.querySelector("#modalTitle");

var inputDateinputName = document.querySelector("#inputName");
var inputCPF = document.querySelector("#inputCPF");
var inputDate = document.querySelector("#inputDate");
var inputCellphone = document.querySelector("#inputCellphone");

var isUpadateSave = false;
var currentId = 0;

const getLocalStorage = () => JSON.parse(localStorage.getItem('db_person')) ?? [];
const setLocalStorage = (dbPerson) => localStorage.setItem("db_person", JSON.stringify(dbPerson));

btnCreat.addEventListener('click', function() {
    isUpadateSave = false;
    modalTitle.innerHTML = "Criar novo usuario";
    btnSaveOrUpdate.innerHTML = "Salvar";
    
    clearFildsTableModal();
}) 

btnSaveOrUpdate.addEventListener('click', function() {
    if(verifyFildsTableModal()){
        if(!isUpadateSave){
            if(savePerson(getPersonModalForm())){
                alert("Pessoa criada com sucesso!")
            } else {
                alert("Não foi possivel criar pessoa!")
            }
        } else { 
            if(updatePerson(currentId)){
                alert("Pessoa atualizada com sucesso!")
            } else {
                alert("Não foi possivel atualizar pessoa!")
            }
        } 
    }

    updateTable();
});

function onClickEdit(id) {
    isUpadateSave = true;
    modalTitle.innerHTML = "Editar Usuario";
    btnSaveOrUpdate.innerHTML = "Atualizar";
    currentId = id;
    
    clearFildsTableModal();

    let person = findPersonById(id);
    
    inputName.value = person.name;
    inputCPF.value  = person.cpf;
    inputDate.value = person.date;
    inputCellphone.value = person.cellphone;
} 

function onClickDelete(id){
    let isDeleteOP = confirm("Deseja escluir esta pessoa?");
    
    if(isDeleteOP){
        if(deletePersonById(id)){
            alert("Pessoa deletada com sucesso!");
            updateTable();
        }
    }
}

function getPersonModalForm(){
    let lastId = findLastID();

    let newPerson = {
        id : lastId + 1,
        name : inputName.value,
        cpf: inputCPF.value,
        date: inputDate.value ?? null,
        cellphone: inputCellphone.value ?? null
    }

    return newPerson
}

//CRUD
function savePerson(newPerson){
    const dbPerson = getLocalStorage();

    dbPerson.push(newPerson);
    setLocalStorage(dbPerson);

    return true;
}

function updatePerson(id){
    const dbPerson = getLocalStorage();

    if(verifyFildsTableModal){
        dbPerson.forEach(person => {
            if(person.id === id){
                person.name = inputName.value;
                person.cpf = inputCPF.value;
                person.date = inputDate.value ?? null;
                person.cellphone = inputCellphone.value ?? null;
            }
        });

        setLocalStorage(dbPerson);
    }

    return true;
}

function findLastID(){
    const dbPerson = getLocalStorage();
    let length = Object.keys(dbPerson).length;
    let lastId = 0;

    if(length <= 0) {
        return 0;
    } else{
        dbPerson.forEach(person => {
            if(person.id > lastId){
                lastId = person.id;
            }
        });
    }

    return lastId;
}

function findPersonById(id){
    const dbPerson = getLocalStorage();
    let personReturn;
    
    dbPerson.forEach(person => {
        if(person.id === id){
            personReturn = person;
        }
    });

    return personReturn ?? null;
}

function findPersonByCPF(cpf){
    const dbPerson = getLocalStorage();
    let personReturn;
    
    dbPerson.forEach(person => {
        if(person.cpf === cpf){
            personReturn = person;
        }
    });

    return personReturn ?? null;
}

function isCPFregistered(cpfNumber){
    const dbPerson = getLocalStorage ();
    cpfNumber = String(cpfNumber);

    let isRegistered = false;

    dbPerson.forEach(person => {
        if(person.cpf === cpfNumber){
            isRegistered = true;
        }
    });

    return isRegistered;
}

function deletePersonById(id){
    const dbPerson = getLocalStorage();
    let personReturn = findPersonById(id);

    const requiredIndex = dbPerson.findIndex(person => {
        return person.id === id;
    });

    dbPerson.splice(requiredIndex, 1);
    
    setLocalStorage(dbPerson)

    return true;
}

//TABLE
function clearTable(){
    const table = document.querySelector("#personTable>tbody")
    table.innerHTML = null;
}

function updateTable(){
    clearTable();
    const dbPerson = getLocalStorage();
    const table = document.querySelector("#personTable>tbody")
    
    dbPerson.forEach(person => {
        const newRow = document.createElement('tr')
        newRow.innerHTML = `
            <th scope="col">${person.id}</th>
            <th scope="col">${person.name}</th>
            <th scope="col">${getCPFFormatted(person.cpf)}</th>
            <th scope="col">${person.date}</th>
            <th scope="col">${person.cellphone}</th>
            <td>
                <button id="btnEdit-${person.id}" type="button" class="btn btn-dark" data-bs-toggle ="modal" data-bs-target="#formModal">Editar</button>
                <button id="btnDelete-${person.id}" type="button" class="btn btn-outline-dark">excluir</button>
            </td>
        `; 
    
        table.appendChild(newRow);
        
        let btnEdit = document.querySelector(`#btnEdit-${person.id}`);
        let btnDelete = document.querySelector(`#btnDelete-${person.id}`);

        btnEdit.addEventListener('click', () => {
            onClickEdit(person.id);
        })

        btnDelete.addEventListener('click', () => {
            onClickDelete(person.id);
        })

    });
}

function verifyFildsTableModal(){
    if(!inputName.value){
        alert("Nome é um capo obrigatorio!");
        return false;
    }


    if(!inputCPF.value){
        alert("CPF é um capo obrigatorio!");
        return false;
    } else{
        let isCPFvalid = cPFValidator(inputCPF.value)
        if(!isCPFvalid){
            alert("CPF invalido!")
            return false;
        }
        
        let isRegistered = isCPFregistered(inputCPF.value);
        if (isRegistered & !isUpadateSave){
            alert("CPF já cadastrado!")
            return false;
        }
    }

    return true;
}

function clearFildsTableModal(){
    inputName.value = null;
    inputDate.value = null;
    inputCellphone.value = null;
    inputCPF.value = null;
}

//Utils
function getCPFFormatted(cpf){
   cpf  = String(cpf);
   if(!cpf){
    return "-";
   } else {
     let cpfFormatted = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");   
     return cpfFormatted;
   } 
}

function cPFValidator(cpf) {	
	cpf = cpf.replace(/[^\d]+/g,'');	
	if(cpf == '') return false;	

    if (cpf.length != 11 || 
		cpf == "00000000000" || 
		cpf == "11111111111" || 
		cpf == "22222222222" || 
		cpf == "33333333333" || 
		cpf == "44444444444" || 
		cpf == "55555555555" || 
		cpf == "66666666666" || 
		cpf == "77777777777" || 
		cpf == "88888888888" || 
		cpf == "99999999999")
			return false;		

    add = 0;	
	for (i=0; i < 9; i ++)		
		add += parseInt(cpf.charAt(i)) * (10 - i);	
		rev = 11 - (add % 11);	
		if (rev == 10 || rev == 11)		
			rev = 0;	
		if (rev != parseInt(cpf.charAt(9)))		
			return false;		
	
    add = 0;	
	for (i = 0; i < 10; i ++)		
		add += parseInt(cpf.charAt(i)) * (11 - i);	
	rev = 11 - (add % 11);	
	if (rev == 10 || rev == 11)	
		rev = 0;	
	if (rev != parseInt(cpf.charAt(10)))
		return false;		
	return true;   
}

//Seach Modal
var btnFindPerson = document.querySelector("#btnFindPerson");
var inputCPFSeach = document.querySelector("#inputCPFSeach");

btnFindPerson.addEventListener('click', function() {
    let person = findPersonByCPF(inputCPFSeach.value);
    
    if (!person){
        alert("Não existe pessoa cadastrada com esse CPF!")
    } else{
        alert(`            ID: ${person.id} 
            Nome: ${person.name}
            CPF: ${person.cpf}
            Data De Nascimento: ${person.date}
            Telefone: ${person.cellphone}
        `)
    }
    
})

//init method
function init(){
    clearFildsTableModal();
    updateTable();
}

init();
