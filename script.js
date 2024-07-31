function submit()
{
	let blocksize = Number(document.getElementById("blocksize").value)
	let setsize = Number(document.getElementById("setsize").value)
	let memsize = Number(document.getElementById("memsize").value)
	let cmemsize = Number(document.getElementById("cmemsize").value)
	let ccycle = Number(document.getElementById("ccycle").value)
	let mcycle = Number(document.getElementById("mcycle").value)
	let flow = (document.getElementById("flow").value).split(' ').map(Number)
	
	let cache = []
	let setcount = 0
	let lastused = []
	
	let option = document.getElementById("option").value
	if(option.valueOf() == "block".valueOf())
	{
		cache = new Array(cmemsize)
		setcount = cmemsize / setsize
		lastused = new Array(setcount)
	}
	else
	{
		cache = new Array(cmemsize)
		setcount = cmemsize / (blocksize * setsize)
		lastused = new Array(setcount)
	}
	let misscount = 0
	
	for(let i = 0; i < cmemsize; i++)
	{
		cache[i] = -1
	}
	
	if(option.valueOf() == "block".valueOf())
	{
		for(let i = 0; i < flow.length; i++)
		{
			let assignedset = flow[i] % setcount
			
			let notincache = true
			for(let j = assignedset * setsize; j < assignedset * setsize + setsize; j++)
			{
				if(cache[j] == flow[i])
				{
					notincache = false
					break
				}
			}
			
			if(notincache)
			{
				misscount += 1
				let isfull = true
				for(let j = assignedset * setsize; j < assignedset * setsize + setsize; j++)
				{
					if(cache[j] == -1)
					{
						cache[j] = flow[i]
						isfull = false
						break
					}
				}
				
				if(isfull)
				{
					for(let j = assignedset * setsize; j < assignedset * setsize + setsize; j++)
					{
						if(cache[j] == lastused[assignedset])
						{
							cache[j] = flow[i]
							break
						}
					}
				}
			}
			
			lastused[assignedset] = flow[i]
			
			//alert(cache + "\n" + lastused + "\n" + misscount + "\n" + i)
		}
	}
	else
	{
		for(let i = 0; i < flow.length; i++)
		{
			let assignedset = flow[i] % setcount
			
			let notincache = true
			for(let j = assignedset * blocksize * setsize; j < assignedset * blocksize * setsize + blocksize * setsize; j++)
			{
				if(cache[j] == flow[i])
				{
					notincache = false
					break
				}
			}
			
			if(notincache)
			{
				misscount += 1
				let isfull = true
				for(let j = assignedset * blocksize * setsize; j < assignedset * blocksize * setsize + blocksize * setsize; j++)
				{
					if(cache[j] == -1)
					{
						cache[j] = flow[i]
						isfull = false
						break
					}
				}
				
				if(isfull)
				{
					for(let j = assignedset * blocksize * setsize; j < assignedset * blocksize * setsize + blocksize * setsize; j++)
					{
						if(cache[j] == lastused[assignedset])
						{
							cache[j] = flow[i]
							break
						}
					}
				}
			}
			
			lastused[assignedset] = flow[i]
			
		}
	}
	
	let hitcount = flow.length - misscount
	let penalty = mcycle * 2 + ccycle * 2
	document.getElementById("hits").value = hitcount
	document.getElementById("misses").value = misscount
	document.getElementById("penalty").value = penalty
	document.getElementById("average").value = (hitcount / flow.length) * ccycle + (misscount / flow.length) * penalty
	document.getElementById("total").value = hitcount * 2 * ccycle + misscount * 2 * (ccycle + mcycle)	+ misscount * ccycle
	const snapshotBody = document.getElementById("snapshotBody");
    snapshotBody.innerHTML = ""; // Clear previous rows

    if (option.valueOf() == "block".valueOf()) {
        let setmultiplier = 1;
        for (let i = 0; i < cache.length; i++) {
            if (i == setmultiplier * setsize) {
                setmultiplier += 1;
            }
            // Create a new row for the table
            const row = snapshotBody.insertRow();
            row.insertCell(0).innerText = (setmultiplier - 1).toString(); // Set
            row.insertCell(1).innerText = (i % setsize).toString();       // Block
            row.insertCell(2).innerText = cache[i].toString();            // Value
        }
    } else {
        let setmultiplier = 1;
        let blockmultiplier = 1;
        for (let i = 0; i < cache.length; i++) {
            if (i == setmultiplier * setsize * blocksize) {
                setmultiplier += 1;
            }
            if (i == blockmultiplier * blocksize) {
                blockmultiplier += 1;
            }
            // Create a new row for the table
            const row = snapshotBody.insertRow();
            row.insertCell(0).innerText = (setmultiplier - 1).toString();      // Set
            row.insertCell(1).innerText = (blockmultiplier - 1).toString();    // Block
            row.insertCell(2).innerText = cache[i].toString();                 // Value
        }
    }
	$('#getOutput').off('click').on('click', function() {
		// Prepare snapshot text output
		let snapshotText = "Set\tBlock\tValue\n"; // Header for the text file
	
		if (option.valueOf() == "block".valueOf()) {
			let setmultiplier = 1;
			for (let i = 0; i < cache.length; i++) {
				if (i == setmultiplier * setsize) {
					setmultiplier += 1;
				}
				// Append to text output
				snapshotText += `${setmultiplier - 1}\t${i % setsize}\t${cache[i]}\n`;
			}
		} else {
			let setmultiplier = 1;
			let blockmultiplier = 1;
			for (let i = 0; i < cache.length; i++) {
				if (i == setmultiplier * setsize * blocksize) {
					setmultiplier += 1;
				}
				if (i == blockmultiplier * blocksize) {
					blockmultiplier += 1;
				}
				// Append to text output
				snapshotText += `${setmultiplier - 1}\t${blockmultiplier - 1}\t${cache[i]}\n`;
			}
		}
	
		// Append hitcount and misscount to snapshot text
		snapshotText += `\nHitcount: ${hitcount}\nMisscount: ${misscount}\nMiss Penalty: ${penalty}\nAverage Mem Access: ${(hitcount / flow.length) * ccycle + (misscount / flow.length) * penalty}\nTotal Mem Access: ${hitcount * 2 * ccycle + misscount * 2 * (ccycle + mcycle) + misscount * ccycle}\n`;
	
		// Create a blob for the text file output
		const blob = new Blob([snapshotText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
	
		// Create a temporary link to download the file
		const a = document.createElement('a');
		a.href = url;
		a.download = 'cache_snapshot.txt'; // Specify the filename
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url); // Clean up the URL object
	});

}